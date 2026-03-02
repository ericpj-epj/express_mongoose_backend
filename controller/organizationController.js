import Organization from "../model/organizationsModel.js";
import Member from "../model/membersModel.js";
import mongoose from "mongoose";

export const fetchOrganization = async (req, res) => {
  const search = (req.query.search || "").trim();
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 50;

  page = Math.max(1, page);
  limit = Math.max(1, Math.min(200, limit));
  const skip = (page - 1) * limit;

  const query = {};
  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { name: { $regex: escapedSearch, $options: "i" } },
      { description: { $regex: escapedSearch, $options: "i" } },
      { allowed_domains: { $regex: escapedSearch, $options: "i" } },
    ];
  }

  const total = await Organization.countDocuments(query);

  const pipeline = [
    { $match: query },
    { $sort: { created_at: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: "members",
        localField: "_id",
        foreignField: "organization_id",
        as: "members",
      },
    },
    {
      $addFields: {
        member_count: { $size: "$members" },
      },
    },
    { $project: { members: 0 } },
  ];

  const orgs = await Organization.aggregate(pipeline);

  const organizations = orgs.map((org) => ({
    id: org._id.toString(),
    name: org.name,
    description: org.description,
    allowed_domains: org.allowed_domains || [],
    apps_and_tools: org.apps_and_tools,
    member_count: org.member_count,
  }));

  const pages = total ? Math.ceil(total / limit) : 1;

  res.json({
    success: true,
    message: "Organizations fetched successfully",
    organizations,
    pagination: { page, limit, total, pages },
  });
};

export const getOrganizationMembers = async (req, res) => {
  try {
    const { org_id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(org_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organization id",
      });
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Query
    const [members, total] = await Promise.all([
      Member.find({ organization_id: org_id })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Member.countDocuments({ organization_id: org_id }),
    ]);

    return res.json({
      success: true,
      message: "Organization members fetched successfully",
      members,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get organization members error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const fetchOrganizationsDetail = async (req, res) => {
  try {
    const organizationId = req.params.org_id;

    const organizationImport = await Organization.findById(organizationId);

    if (!organizationImport) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const parsedOrganization = {
      _id: String(organizationImport._id),
      name: organizationImport.name,
      description: organizationImport.description,
      allowed_domains: organizationImport.allowed_domains,
      apps_and_tools: {
        leadlogic: organizationImport.apps_and_tools.leadlogic,
        signals: organizationImport.apps_and_tools.signals,
        skutrition: organizationImport.apps_and_tools.skutrition,
        internal_tools: organizationImport.apps_and_tools.internal_tools,
      },
      created_at: organizationImport.createdAt?.$date,
      updated_at: organizationImport.updatedAt?.$date,
    };

    res.json({
      success: true,
      message: "Organization detail fetched successfully",
      organization: parsedOrganization,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load Organization detail",
      error: error.message,
    });
  }
};

export const updateOrganization = async (req, res) => {
  try {
    const organizationId = req.params.org_id;
    const updateData = req.body;

    const updatedOrganization = await Organization.findByIdAndUpdate(
      organizationId,
      updateData,
      { new: true },
    );
    if (!updatedOrganization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    res.json({
      success: true,
      message: "Organization updated successfully",
      organization: updatedOrganization,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update Organization",
      error: error.message,
    });
  }
};
export const deleteOrganization = async (req, res) => {
  try {
    const organizationId = req.params.org_id;
    const deletedSupplier =
      await Organization.findByIdAndDelete(organizationId);
    if (!deletedSupplier) {
      throw new AppError(
        "Organization not found",
        404,
        "ORGANIZATION_NOT_FOUND",
      );
    }
    res.status(200).json({ message: "Organization deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete Organization",
      error: {
        code: error.code || "SERVER_ERROR",
        message: error.message || "Server error",
      },
    });
  }
};
