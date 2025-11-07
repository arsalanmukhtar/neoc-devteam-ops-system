import { pool } from "../server.js";

// Create a new time entry request
export const createTimeEntryRequest = async (req, res) => {
    const { user_id } = req.user; // from auth middleware
    const { task_id, start_time, end_time, notes } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO requests (user_id, task_id, start_time, end_time, notes, status)
             VALUES ($1, $2, $3, $4, $5, 'pending')
             RETURNING *`,
            [user_id, task_id, start_time, end_time, notes]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating time entry request:', error);
        res.status(500).json({ error: 'Failed to create request' });
    }
};

// Get all time entry requests (optionally filter by status)
export const getTimeEntryRequests = async (req, res) => {
    const { status } = req.query;
    let query = `SELECT r.*, u.first_name AS user_first_name, u.last_name AS user_last_name, t.title AS task_title
                 FROM requests r
                 JOIN users u ON r.user_id = u.user_id
                 JOIN tasks t ON r.task_id = t.task_id`;
    const params = [];
    if (status) {
        query += ` WHERE r.status = $1`;
        params.push(status);
    }
    query += ` ORDER BY r.created_at DESC`;
    try {
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
};

// Accept a time entry request
export const acceptTimeEntryRequest = async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.user; // reviewer
    try {
        // Get the request
        const requestRes = await pool.query(
            `SELECT * FROM requests WHERE request_id = $1 AND status = 'pending'`,
            [id]
        );
        if (requestRes.rows.length === 0) {
            return res.status(404).json({ error: 'Request not found or already processed' });
        }
        const request = requestRes.rows[0];

        // Insert into time_entries
        await pool.query(
            `INSERT INTO time_entries (user_id, task_id, start_time, end_time, notes)
             VALUES ($1, $2, $3, $4, $5)`,
            [request.user_id, request.task_id, request.start_time, request.end_time, request.notes]
        );

        // Update request status to accepted
        await pool.query(
            `UPDATE requests SET status = 'accepted', reviewed_by = $1, reviewed_at = NOW() WHERE request_id = $2`,
            [user_id, id]
        );

        res.json({ message: 'Request accepted and time entry created.' });
    } catch (error) {
        console.error('Error accepting request:', error);
        res.status(500).json({ error: 'Failed to accept request' });
    }
};

// Reject a time entry request
export const rejectTimeEntryRequest = async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.user; // reviewer
    const { review_comment } = req.body;
    try {
        // Update request status to rejected and optionally delete
        await pool.query(
            `UPDATE requests SET status = 'rejected', reviewed_by = $1, reviewed_at = NOW(), review_comment = $2 WHERE request_id = $3`,
            [user_id, review_comment || '', id]
        );
        // Optionally, delete the row after review (or keep for audit)
        // await pool.query(`DELETE FROM requests WHERE request_id = $1`, [id]);
        res.json({ message: 'Request rejected.' });
    } catch (error) {
        console.error('Error rejecting request:', error);
        res.status(500).json({ error: 'Failed to reject request' });
    }
};