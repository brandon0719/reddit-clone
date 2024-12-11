import React from "react";
import { useState } from "react";
import "../../stylesheets/EditComment.css";

const EditCommentPage = ({ 
    comment,
    onSave, 
    onCancel, 
}) => {
    // Pre-fill the form fields with the existing comment data
    const [content, setContent] = useState(comment.content);
    const [errors, setErrors] = useState({ content: "" });

    // Validate inputs
    const validate = () => {
        const newErrors = { content: "" };

        if (!content.trim()) {
            newErrors.content = "Comment content is required.";
        } else if (content.length > 500) {
            newErrors.content = "Comment cannot be longer than 500 characters.";
        }

        setErrors(newErrors);
        return !newErrors.content;
    };

    // Handle submit
    const handleSave = (e) => {
        e.preventDefault();
        if (validate()) {
            onSave({
                ...comment,
                content: content.trim(), // Update the content
            });
        }
    };

    return (
        <div className="edit-comment-page main-content">
            <div className="card">
                <h2 className="card-title">Edit Comment</h2>
                <form onSubmit={handleSave} className="card-form">
                    <div className="form-group">
                        <label htmlFor="content" className="form-label">
                            Comment (required, max 500 characters):
                        </label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className={`form-textarea ${
                                errors.content ? "input-error" : ""
                            }`}
                            maxLength={500}
                            placeholder="Edit your comment..."
                        />
                        {errors.content && (
                            <p className="error-text">{errors.content}</p>
                        )}
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn">
                            Save Changes
                        </button>
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={onCancel}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCommentPage;