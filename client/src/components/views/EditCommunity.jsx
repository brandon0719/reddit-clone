import React, { useState } from "react";
import "../../stylesheets/EditCommunity.css";
import ApiService from "../../services/ApiService.jsx";

const EditCommunity = ({ community, communities, onSave, onCancel }) => {
    const [communityName, setCommunityName] = useState(community?.name || "");
    const [communityDescription, setCommunityDescription] = useState(
        community?.description || ""
    );

    const isUniqueCommunityName = (name) => {
        return !communities.some(
            (existingCommunity) =>
                existingCommunity.name.toLowerCase() === name.toLowerCase() &&
                existingCommunity._id !== community._id // Exclude current community
        );
    };

    const checkInputs = () => {
        // Community name validation
        if (!communityName.trim()) {
            alert("Community name is required.");
            return false;
        } else if (communityName.length > 100) {
            alert("Community name cannot exceed 100 characters.");
            return false;
        }
        if (!isUniqueCommunityName(communityName)) {
            alert(
                "Community name already exists. Please choose a different name."
            );
            return false;
        }

        // Community description validation
        if (!communityDescription.trim()) {
            alert("Community description is required.");
            return false;
        } else if (communityDescription.length > 500) {
            alert("Description cannot exceed 500 characters.");
            return false;
        }

        return true;
    };
    const handleSave = async () => {
        if (!checkInputs()) return;

        try {
            const updatedCommunity = {
                ...community,
                name: communityName,
                description: communityDescription,
            };

            const response = await ApiService.updateCommunity(
                community._id,
                updatedCommunity
            );
            console.log("Community updated:", response);
            onSave(response); // Pass the updated community back to the parent
        } catch (error) {
            console.error("Failed to update community:", error);
        }
    };

    return (
        <div className="edit-community main-content">
            <form onSubmit={(e) => e.preventDefault()}>
                <h2>Edit Community</h2>
                <label htmlFor="community-name">
                    <strong>Community Name</strong> (required, max 100
                    characters):
                </label>
                <input
                    type="text"
                    id="community-name"
                    value={communityName}
                    onChange={(e) => setCommunityName(e.target.value)}
                />

                <label htmlFor="edit-community-description">
                    <strong>Community Description</strong>(required, max 500
                    characters):
                </label>
                <textarea
                    id="edit-community-description"
                    rows="5"
                    value={communityDescription}
                    onChange={(e) => setCommunityDescription(e.target.value)}
                />

                <button type="button" onClick={handleSave}>
                    Save Changes
                </button>
                <button type="button" onClick={onCancel}>
                    Cancel
                </button>
            </form>
        </div>
    );
};

export default EditCommunity;
