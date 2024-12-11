import React, { useState } from 'react';
import "../../stylesheets/CreateCommunity.css";

const CreateCommunity = ({ communities, handleCreateCommunity, onCancel, user }) => {
    const [communityName, setCommunityName] = useState("");
    const [communityDescription, setCommunityDescription] = useState("");

    // find next community ID
    const generateCommunityID = () => {
        const communityIDs = communities.map((community) =>
            parseInt(community.communityID.replace("community", ""), 10)
        );
        const maxID = Math.max(...communityIDs, 0); // find the max
        return `community${maxID + 1}`; // increment by 1 
    };


    // check submission form criteria
    const checkInputs = () => {
        // community name check
        if (!communityName) {
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

        // description check
        if (!communityDescription) {
            alert("Community description is required.");
            return false;
        } else if (communityDescription.length > 500) {
            alert("Description cannot exceed 500 characters.");
            return false;
        }

        return true;
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (checkInputs()) {
            const newCommunity = {
                communityID: generateCommunityID,
                name: communityName,
                description: communityDescription,
                postIDs: [],
                startDate: new Date(),
                members: [user.displayName],
                memberCount: 1,
            };

            handleCreateCommunity(newCommunity);

            // Reset form fields after submission
            setCommunityName("");
            setCommunityDescription("");
        }
    };

    const isUniqueCommunityName = (name) => {
        return !communities.some(
            (community) => community.name.toLowerCase() === name.toLowerCase()
        );
    };


    return (
        <div className="create-community main-content">
            <form onSubmit={handleSubmit}>
                <h2>Create a New Community</h2>
                <label>
                    <strong>Community Name</strong> (required, max 100
                    characters):
                </label>
                <input
                    type="text"
                    value={communityName}
                    onChange={(e) => setCommunityName(e.target.value)}
                    maxLength="100"
                    required
                />

                <label>
                    <strong>Community Description</strong> (required, max 500
                    characters):
                </label>
                <textarea
                    value={communityDescription}
                    onChange={(e) => setCommunityDescription(e.target.value)}
                    maxLength="500"
                    required
                />

                <button type="submit">Engender Community</button>
                <button type="button" onClick={onCancel}>
                    Cancel
                </button>
            </form>
        </div>
    );
};

export default CreateCommunity;
