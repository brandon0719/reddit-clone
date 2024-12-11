import React from "react";
import { useState } from "react";
import "../../stylesheets/NewCommentPage.css";

const NewCommentPage = ( {post, parentComment, onSubmitComment, user} ) => {
    const [content, setContent] = useState("");
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
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmitComment({
                userName: user.displayName,
                content: content.trim(),
                parentCommentID: parentComment ? parentComment._id : null,
                postID: post._id,
            });
        }
    };

    return (
        <div className="new-comment-page main-content">
            <form onSubmit={handleSubmit} className="comment-form">
                <h2 className="page-title">
                    {parentComment ? "Reply to Comment" : "Add a Comment"}
                </h2>
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
                        placeholder="Write your comment..."
                    />
                    {errors.content && (
                        <p className="error-text">{errors.content}</p>
                    )}
                </div>

                <div className="form-group">
                    <button type="submit" className="submit-btn">
                        Submit Comment
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewCommentPage;
