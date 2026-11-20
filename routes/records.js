const express = require("express");
const router = express.Router();
const pool = require("../db");

const ALLOWED_STATUSES = ["Pending", "In progress", "Completed"];

function parsePositiveId(rawId) {
    if (!/^\d+$/.test(String(rawId))) {
        return null;
    }
    const num = Number(rawId);
    if (!Number.isSafeInteger(num) || num <= 0) {
        return null;
    }
    return num;
}

function validateEditablePayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return { error: "Request body must be a JSON object." };
    }

    const { title, category, description, status } = body;

    if (typeof title !== "string") {
        return { error: "Title must be a string." };
    }
    if (typeof category !== "string") {
        return { error: "Category must be a string." };
    }
    if (typeof description !== "string") {
        return { error: "Description must be a string." };
    }
    if (typeof status !== "string") {
        return { error: "Status must be a string." };
    }

    const trimmedTitle = title.trim();
    const trimmedCategory = category.trim();
    const trimmedDescription = description.trim();
    const trimmedStatus = status.trim();

    if (trimmedTitle.length < 3 || trimmedTitle.length > 80) {
        return { error: "Title must have 3 to 80 characters." };
    }
    if (trimmedCategory.length < 2 || trimmedCategory.length > 40) {
        return { error: "Category must have 2 to 40 characters." };
    }
    if (trimmedDescription.length < 5 || trimmedDescription.length > 300) {
        return { error: "Description must have 5 to 300 characters." };
    }
    if (!ALLOWED_STATUSES.includes(trimmedStatus)) {
        return { error: "Status must be one of: Pending, In progress, Completed." };
    }

    return {
        value: {
            title: trimmedTitle,
            category: trimmedCategory,
            description: trimmedDescription,
            status: trimmedStatus
        }
    };
}

// GET /api/records
router.get("/", async (req, res, next) => {
    try {
        const result = await pool.query(
            "SELECT id, title, category, description, status FROM records ORDER BY id ASC"
        );
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
});

// GET /api/records/:id
router.get("/:id", async (req, res, next) => {
    const id = parsePositiveId(req.params.id);
    if (!id) {
        return res.status(400).json({ message: "ID must be a positive whole number." });
    }

    try {
        const result = await pool.query(
            "SELECT id, title, category, description, status FROM records WHERE id = $1",
            [id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: `Record with id ${id} not found.` });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

// POST /api/records
router.post("/", async (req, res, next) => {
    const { error, value } = validateEditablePayload(req.body);
    if (error) {
        return res.status(400).json({ message: error });
    }

    try {
        const result = await pool.query(
            `INSERT INTO records (title, category, description, status)
             VALUES ($1, $2, $3, $4)
             RETURNING id, title, category, description, status`,
            [value.title, value.category, value.description, value.status]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

// PUT /api/records/:id
router.put("/:id", async (req, res, next) => {
    const id = parsePositiveId(req.params.id);
    if (!id) {
        return res.status(400).json({ message: "ID must be a positive whole number." });
    }

    const { error, value } = validateEditablePayload(req.body);
    if (error) {
        return res.status(400).json({ message: error });
    }

    try {
        const result = await pool.query(
            `UPDATE records
             SET title = $1, category = $2, description = $3, status = $4
             WHERE id = $5
             RETURNING id, title, category, description, status`,
            [value.title, value.category, value.description, value.status, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: `Record with id ${id} not found.` });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/records/:id
router.delete("/:id", async (req, res, next) => {
    const id = parsePositiveId(req.params.id);
    if (!id) {
        return res.status(400).json({ message: "ID must be a positive whole number." });
    }

    try {
        const result = await pool.query(
            "DELETE FROM records WHERE id = $1 RETURNING id",
            [id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: `Record with id ${id} not found.` });
        }
        res.status(200).json({ message: "Record deleted." });
    } catch (error) {
        next(error);
    }
});

module.exports = router;