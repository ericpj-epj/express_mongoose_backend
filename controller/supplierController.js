import Supplier from "../model/supplierModel.js";

/**
 * Fetches a paginated list of all suppliers with their ingredients and claims
 * @param {Object} req - Express request object with query params: page, per_page
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with suppliers array and pagination info
 */
export const fetchSuppliers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 10;

    const supplierImport = await Supplier.find()
      .limit(perPage)
      .skip((page - 1) * perPage);
    const parsedSuppliers = supplierImport.map((supplier) => {
      const categorySet = new Set();

      supplier.ingredients?.forEach((ingredient) => {
        ingredient.claims?.forEach((claim) => {
          if (claim.category) {
            categorySet.add(claim.category);
          }
        });
      });

      return {
        _id: String(supplier._id),
        name: supplier.name,
        domain: supplier.domain,
        ingredients:
          supplier.ingredients?.map((ingredient) => ({
            _id: String(ingredient._id),
            ingredient_name: ingredient.ingredient_name,
            description: ingredient.description,
            limitations: ingredient.limitations,
            application_notes: ingredient.application_notes,
            claims: ingredient.claims?.map((claim) => ({
              _id: String(claim._id),
              claim_text: claim.claim_text,
              category: claim.category,
            })),
          })) || [],
        orgId: String(supplier.ingredient_supplier_org_id) || null,
        created_at: supplier.createdAt?.$date,
        updated_at: supplier.updatedAt?.$date,
      };
    });

    const totalItems = parsedSuppliers.length;
    const totalPages = Math.ceil(totalItems / perPage);
    const start = (page - 1) * perPage;

    res.json({
      success: true,
      message: "Suppliers fetched successfully",
      data: {
        suppliers: parsedSuppliers.slice(start, start + perPage),
        pagination: {
          page,
          per_page: perPage,
          total: totalItems,
          pages: totalPages,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load suppliers",
      error: {
        code: error.code || "SERVER_ERROR",
        message: error.message || "Server error",
      },
    });
  }
};

/**
 * Fetches detailed information for a specific supplier by ID
 * @param {Object} req - Express request object with params: id
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with supplier details or 404 if not found
 */
export const fetchSuppliersDetail = async (req, res) => {
  try {
    const supplierId = req.params.id;
    const supplierImport = await Supplier.findOne({ _id: supplierId });

    if (!supplierImport) {
      throw new AppError("Supplier not found", 404, "SUPPLIER_NOT_FOUND");
    }

    const parsedSupplier = {
      _id: String(supplierImport._id),
      name: supplierImport.name,
      domain: supplierImport.domain,
      ingredients:
        supplierImport.ingredients?.map((ingredient) => ({
          _id: String(ingredient._id),
          ingredient_name: ingredient.ingredient_name,
          description: ingredient.description,
          limitations: ingredient.limitations,
          application_notes: ingredient.application_notes,
          claims: ingredient.claims?.map((claim) => ({
            id: claim._id?.$oid,
            claim_text: claim.claim_text,
            category: claim.category,
          })),
        })) || [],
      orgId: String(supplierImport.ingredient_supplier_org_id) || null,
      created_at: supplierImport.createdAt?.$date,
      updated_at: supplierImport.updatedAt?.$date,
    };

    res.json({
      success: true,
      message: "Supplier detail fetched successfully",
      supplier: parsedSupplier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load supplier detail",
      error: {
        code: error.code || "SERVER_ERROR",
        message: error.message || "Server error",
      },
    });
  }
};

/**
 * Creates a new supplier with a unique 24-character ID
 * @param {Object} req - Express request object with body: name, domain
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created supplier or error if supplier already exists
 */
export const addSupplier = async (req, res) => {
  try {
    const { name, domain } = req.body;
    const supplierExists = await Supplier.findOne({ name });

    if (supplierExists) {
      throw new AppError("Supplier already exists", 400, "SUPPLIER_EXISTS");
    }

    const newSupplier = new Supplier({ name, domain });
    const savedSupplier = await newSupplier.save();
    res.status(201).json(savedSupplier);
  } catch (error) {
    res.status(500).json({
      message: "Failed to add supplier",
      error: {
        code: error.code || "SERVER_ERROR",
        message: error.message || "Server error",
      },
    });
  }
};

/**
 * Updates an existing supplier by ID
 * @param {Object} req - Express request object with params: id and body with update data
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated supplier or 404 if not found
 */
export const updateSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;
    const updateData = req.body;

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      supplierId,
      updateData,
      { new: true },
    );
    if (!updatedSupplier) {
      throw new AppError("Supplier not found", 404, "SUPPLIER_NOT_FOUND");
    }
    res.json({
      success: true,
      message: "Supplier updated successfully",
      supplier: updatedSupplier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update supplier",
      error: {
        code: error.code || "SERVER_ERROR",
        message: error.message || "Server error",
      },
    });
  }
};

/**
 * Deletes a supplier by ID
 * @param {Object} req - Express request object with params: id
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message or 404 if supplier not found
 */
export const deleteSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;
    const deletedSupplier = await Supplier.findByIdAndDelete(supplierId);
    if (!deletedSupplier) {
      throw new AppError("Supplier not found", 404, "SUPPLIER_NOT_FOUND");
    }
    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete supplier",
      error: {
        code: error.code || "SERVER_ERROR",
        message: error.message || "Server error",
      },
    });
  }
};
