// File: src/components/ProjectList.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/projects'; 

const ProjectList = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Authentication required. Please log in.");
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(API_URL, {
                    headers: {
                        // Crucial step: attaching the token to access protected routes
                        Authorization: `Bearer ${token}`, 
                    },
                });

                setProjects(response.data);
                
            } catch (err) {
                console.error("Error fetching projects:", err.response || err);
                if (err.response && (err.response.status === 401 || err.response.status === 400)) {
                    setError("Session expired or invalid token. Please re-login.");
                    // Optional: force logout if token is invalid
                    // localStorage.removeItem('token'); 
                    // window.location.reload(); 
                } else {
                    setError("Failed to fetch projects. Server error.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    // Helper to dynamically get color for project status
    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return 'var(--color-status-info)';
            case 'Completed':
                return 'var(--color-status-success)';
            case 'On Hold':
                return 'var(--color-status-warning)';
            case 'Canceled':
                return 'var(--color-status-danger)';
            default:
                return 'var(--color-dark-gray)';
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>Loading Projects...</div>;
    }

    if (error) {
        return <div style={{ textAlign: 'center', padding: 'var(--space-lg)', color: 'var(--color-status-danger)' }}>Error: {error}</div>;
    }

    return (
        <div className="project-list-container" style={{ padding: 'var(--space-lg)', maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ color: 'var(--color-accent)', borderBottom: '2px solid var(--color-medium-gray)', paddingBottom: 'var(--space-sm)' }}>
                Active Projects ({projects.length})
            </h2>

            <div className="project-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: 'var(--space-md)' 
            }}>
                {projects.map(project => (
                    <div 
                        key={project.project_id} 
                        className="project-card" 
                        style={{ 
                            backgroundColor: 'var(--color-light-gray)', 
                            padding: 'var(--space-md)', 
                            borderRadius: 'var(--space-sm)',
                            borderLeft: `5px solid ${getStatusColor(project.status)}`,
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <h3 style={{ margin: '0 0 var(--space-sm) 0', color: 'var(--color-black)' }}>{project.name}</h3>
                        
                        <p style={{ margin: '0 0 var(--space-sm) 0', fontSize: 'small', color: getStatusColor(project.status), fontWeight: 'bold' }}>
                            Status: {project.status}
                        </p>
                        
                        <p style={{ margin: '0 0 var(--space-sm) 0', color: 'var(--color-dark-gray)', fontSize: 'small' }}>
                            Manager: **{project.manager_first_name} {project.manager_last_name}**
                        </p>
                        
                        <p style={{ fontSize: '0.9em', color: 'var(--color-dark-gray)' }}>
                            {project.description ? project.description.substring(0, 100) + '...' : 'No description provided.'}
                        </p>
                        
                        <button className="btn btn-secondary" style={{ marginTop: 'var(--space-sm)' }}>View Details</button>
                    </div>
                ))}
            </div>
            
            {projects.length === 0 && !loading && (
                <p style={{ textAlign: 'center', color: 'var(--color-dark-gray)', marginTop: 'var(--space-lg)' }}>No projects found.</p>
            )}
        </div>
    );
};

export default ProjectList;