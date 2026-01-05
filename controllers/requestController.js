import { pool } from "../server.js";

// Create a new time entry request (supports update requests)
export const createTimeEntryRequest = async (req, res) => {
  const { user_id } = req.user; // from auth middleware
  const { entry_id, task_id, start_time, end_time, notes, priority } = req.body;
  try {
    // If this is an update request (entry_id exists), set the time_entry status to pending immediately
    if (entry_id) {
      await pool.query(
        `UPDATE time_entries SET status = 'pending' WHERE entry_id = $1`,
        [entry_id]
      );
    }

    const result = await pool.query(
      `INSERT INTO requests (user_id, entry_id, task_id, start_time, end_time, notes, priority, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
             RETURNING *`,
      [user_id, entry_id || null, task_id, start_time, end_time, notes, priority || 'Medium']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating time entry request:", error);
    res.status(500).json({ error: "Failed to create request" });
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
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};

// Accept a time entry request (update if entry_id exists, else insert)
export const acceptTimeEntryRequest = async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.user; // reviewer
  const { review_comment } = req.body; // feedback from reviewer
  try {
    // Get the request
    const requestRes = await pool.query(
      `SELECT * FROM requests WHERE request_id = $1 AND status = 'pending'`,
      [id]
    );
    if (requestRes.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Request not found or already processed" });
    }
    const request = requestRes.rows[0];

    if (request.entry_id) {
      // Update existing time entry
      await pool.query(
        `UPDATE time_entries SET
                    task_id = $1,
                    start_time = $2,
                    end_time = $3,
                    notes = $4,
                    priority = $5,
                    status = 'accepted',
                    feedback = $7
                 WHERE entry_id = $6`,
        [
          request.task_id,
          request.start_time,
          request.end_time,
          request.notes,
          request.priority,
          request.entry_id,
          review_comment || null,
        ]
      );
    } else {
      // Insert new time entry with status='accepted'
      await pool.query(
        `INSERT INTO time_entries (user_id, task_id, start_time, end_time, notes, priority, status, feedback)
                 VALUES ($1, $2, $3, $4, $5, $6, 'accepted', $7)`,
        [
          request.user_id,
          request.task_id,
          request.start_time,
          request.end_time,
          request.notes,
          request.priority,
          review_comment || null,
        ]
      );
    }

    // Update request status to accepted
    await pool.query(
      `UPDATE requests SET status = 'accepted', reviewed_by = $1, reviewed_at = NOW(), review_comment = $2 WHERE request_id = $3`,
      [user_id, review_comment || "", id]
    );

    res.json({ message: "Request accepted and time entry processed." });
  } catch (error) {
    console.error("Error accepting request:", error);
    res.status(500).json({ error: "Failed to accept request" });
  }
};

// Reject a time entry request
export const rejectTimeEntryRequest = async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.user; // reviewer
  const { review_comment } = req.body;
  try {
    // Get the request
    const requestRes = await pool.query(
      `SELECT * FROM requests WHERE request_id = $1 AND status = 'pending'`,
      [id]
    );
    if (requestRes.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Request not found or already processed" });
    }
    const request = requestRes.rows[0];

    if (request.entry_id) {
      // Update existing time entry status to rejected (don't change the time data) and add feedback
      await pool.query(
        `UPDATE time_entries SET
                    status = 'rejected',
                    feedback = $2
                 WHERE entry_id = $1`,
        [request.entry_id, review_comment || null]
      );
    } else {
      // Insert new time entry with status='rejected' so user can see it was rejected
      await pool.query(
        `INSERT INTO time_entries (user_id, task_id, start_time, end_time, notes, priority, status, feedback)
                 VALUES ($1, $2, $3, $4, $5, $6, 'rejected', $7)`,
        [
          request.user_id,
          request.task_id,
          request.start_time,
          request.end_time,
          request.notes,
          request.priority,
          review_comment || null,
        ]
      );
    }

    // Update request status to rejected
    await pool.query(
      `UPDATE requests SET status = 'rejected', reviewed_by = $1, reviewed_at = NOW(), review_comment = $2 WHERE request_id = $3`,
      [user_id, review_comment || "", id]
    );

    res.json({ message: "Request rejected." });
  } catch (error) {
    console.error("Error rejecting request:", error);
    res.status(500).json({ error: "Failed to reject request" });
  }
};