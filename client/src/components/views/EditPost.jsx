import React, { useState } from "react";
import "../../stylesheets/EditPost.css";

const EditPost = ({ post, onSave, onCancel, linkFlairs, communities }) => {
    const [title, setTitle] = useState(post.title || "");
    const [content, setContent] = useState(post.content || "");
    let lf = "";
    if (post.linkFlairID) {
        lf = linkFlairs.find((lf) => lf._id === post.linkFlairID).content;
    }
    const [linkFlair, setLinkFlair] = useState(lf);
    const community = communities.find((c) =>
        c.postIDs.includes(post._id)
    ).name;
    const [errors, setErrors] = useState({});

    // Validate inputs
    const validate = () => {
        const newErrors = {};
        if (!title.trim()) newErrors.title = "Post title is required.";
        if (!content.trim()) newErrors.content = "Post content is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle Save
    const handleSave = (e) => {
        e.preventDefault();
        if (validate()) {
            onSave({
                ...post,
                title: title.trim(),
                content: content.trim(),
                linkFlair: linkFlair.trim(),
                linkFlairID: linkFlairs.find((lf) => lf.content === linkFlair)
                    ._id,
            });
        }
    };

    return (
        <div class="edit-post-page main-content">
            <div class="card">
                <form onSubmit={handleSave} className="card-form">
                    <h2 className="card-title">Edit Post</h2>

                    <div class="form-group">
                        <label for="community" class="form-label">
                            Community (cannot be changed):
                        </label>
                        <input
                            type="text"
                            id="community"
                            value={community}
                            readonly
                            class="form-input"
                        />
                    </div>

                    <div class="form-group">
                        <label for="title" class="form-label">
                            Post Title (required):
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            class={`form-input ${
                                errors.title ? "input-error" : ""
                            }`}
                            placeholder="Enter post title"
                            maxlength="100"
                        />
                        {errors.title && (
                            <p class="error-text">{errors.title}</p>
                        )}
                    </div>

                    <div class="form-group">
                        <label for="linkFlair" class="form-label">
                            Link Flair (optional):
                        </label>
                        <select
                            id="linkFlair"
                            value={linkFlair}
                            onChange={(e) => setLinkFlair(e.target.value)}
                            class="form-select">
                            <option value="">Select a flair</option>
                            {linkFlairs.map((flair, index) => (
                                <option key={index} value={flair.content}>
                                    {flair.content}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="content" class="form-label">
                            Post Content (required):
                        </label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            class={`form-textarea ${
                                errors.content ? "input-error" : ""
                            }`}
                            placeholder="Write your post..."></textarea>
                        {errors.content && (
                            <p class="error-text">{errors.content}</p>
                        )}
                    </div>

                    <div class="form-group form-actions">
                        <button type="submit" class="submit-btn">
                            Save Changes
                        </button>
                        <button
                            type="button"
                            class="cancel-btn"
                            onClick={onCancel}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPost;
