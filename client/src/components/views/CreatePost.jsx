import React, { useState } from "react";
import "../../stylesheets/CreatePost.css"; // Add the styles

const CreatePost = ({ communities, linkFlairs, onSubmitPost, user }) => {
    const [community, setCommunity] = useState("");
    const [title, setTitle] = useState("");
    const [linkFlair, setLinkFlair] = useState("");
    const [customFlair, setCustomFlair] = useState("");
    const [content, setContent] = useState("");
    const [errors, setErrors] = useState({});

    // Validate inputs
    const validate = () => {
        let newErrors = {};

        if (!community) {
            newErrors.community = "Please select a community.";
        }
        if (!title.trim()) {
            newErrors.title = "Post title is required.";
        } else if (title.length > 100) {
            newErrors.title = "Post title cannot exceed 100 characters.";
        }
        if (!content.trim()) {
            newErrors.content = "Post content is required.";
        }
        if (customFlair && customFlair.length > 30) {
            newErrors.customFlair = "Custom flair cannot exceed 30 characters.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle submit
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmitPost({
                community,
                title: title.trim(),
                linkFlair: customFlair || linkFlair,
                content: content.trim(),
                username: user.displayName,
            });
        }
    };

    const sortedCommunities = [...communities].sort((a, b) => {
        const userIsMemberA = a.members.includes(user?.displayName); // Check if the user is a member of community A
        const userIsMemberB = b.members.includes(user?.displayName); // Check if the user is a member of community B

        // Sort: communities with user membership first
        if (userIsMemberA && !userIsMemberB) return -1;
        if (!userIsMemberA && userIsMemberB) return 1;

        // If both or neither, sort alphabetically by name
        return a.name.localeCompare(b.name);
    });

    return (
        <div className="new-post-page main-content">
            <div className="card">
                <h2 className="card-title">Create a New Post</h2>
                <form onSubmit={handleSubmit} className="card-form">
                    {/* Community Selection */}
                    <div className="form-group">
                        <label htmlFor="community" className="form-label">
                            Community (required):
                        </label>
                        <select
                            id="community"
                            value={community}
                            onChange={(e) => setCommunity(e.target.value)}
                            className={`form-select ${
                                errors.community ? "input-error" : ""
                            }`}>
                            <option value="">Select a community</option>
                            {sortedCommunities.map((community, index) => (
                                <option key={index} value={community.name}>
                                    {community.name}
                                </option>
                            ))}
                        </select>
                        {errors.community && (
                            <p className="error-text">{errors.community}</p>
                        )}
                    </div>

                    {/* Post Title */}
                    <div className="form-group">
                        <label htmlFor="title" className="form-label">
                            Post Title (required, max 100 characters):
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={`form-input ${
                                errors.title ? "input-error" : ""
                            }`}
                            placeholder="Enter post title"
                            maxLength={100}
                        />
                        {errors.title && (
                            <p className="error-text">{errors.title}</p>
                        )}
                    </div>

                    {/* Link Flair */}
                    <div className="form-group">
                        <label htmlFor="linkFlair" className="form-label">
                            Link Flair (optional):
                        </label>
                        <select
                            id="linkFlair"
                            value={linkFlair}
                            onChange={(e) => setLinkFlair(e.target.value)}
                            className="form-select"
                            disabled={customFlair !== ""}>
                            <option value="">Select a flair</option>
                            {linkFlairs.map((flair, index) => (
                                <option key={index} value={flair.content}>
                                    {flair.content}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Custom Link Flair */}
                    <div className="form-group">
                        <label htmlFor="customFlair" className="form-label">
                            Or create a new Link Flair (max 30 characters):
                        </label>
                        <input
                            type="text"
                            id="customFlair"
                            value={customFlair}
                            onChange={(e) => setCustomFlair(e.target.value)}
                            className={`form-input ${
                                errors.customFlair ? "input-error" : ""
                            }`}
                            placeholder="Enter new flair (optional)"
                            maxLength={30}
                            disabled={linkFlair !== ""}
                        />
                        {errors.customFlair && (
                            <p className="error-text">{errors.customFlair}</p>
                        )}
                    </div>

                    {/* Post Content */}
                    <div className="form-group">
                        <label htmlFor="content" className="form-label">
                            Post Content (required):
                        </label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className={`form-textarea ${
                                errors.content ? "input-error" : ""
                            }`}
                            placeholder="Write your post..."
                        />
                        {errors.content && (
                            <p className="error-text">{errors.content}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="form-group">
                        <button type="submit" className="submit-btn">
                            Submit Post
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
