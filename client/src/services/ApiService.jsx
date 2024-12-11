import axios from "axios";
import { getSessionToken } from "./sessionService";

const http = axios.create({
    baseURL: "http://localhost:8000/api",
});

http.interceptors.request.use((config) => {
    const token = getSessionToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Communities API
function getAllCommunities() {
    return http
        .get("/communities")
        .then((res) => res.data)
        .catch((err) => {
            throw err;
        });
}

function getOneCommunity(id) {
    return http
        .get(`/communities/${id}`)
        .then((res) => res.data)
        .catch((err) => {
            throw err;
        });
}

function addOneCommunity(community) {
    return http
        .post("/communities", community)
        .then((res) => res.data)
        .catch((err) => {
            console.log(err);
            throw err;
        });
}

const updateCommunity = async (communityId, updates) => {
    try {
        const response = await http.put(`/communities/${communityId}`, updates);
        return response.data;
    } catch (error) {
        console.error("Error updating community:", error);
        throw error;
    }
};

function joinCommunity(communityId) {
    return http
        .post(`/communities/${communityId}/join`)
        .then((res) => res.data)
        .catch((err) => {
            console.error("Error joining community:", err);
            throw err;
        })  
}


function leaveCommunity(communityId) {
    return http
        .post(`/communities/${communityId}/leave`)
        .then((res) => res.data)
        .catch((err) => {
            console.error("Error joining community:", err);
            throw err;
        });
}

async function deleteCommunity(communityId) {
    try {
        const response = await http.delete(`/communities/${communityId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting community:", error.response?.data || error.message);
        throw error;
    }
}

// Posts API
function getAllPosts() {
    return http
        .get("/posts")
        .then((res) => res.data)
        .catch((err) => {
            throw err;
        });
}

function getOnePost(id) {
    return http
        .get(`/posts/${id}`)
        .then((res) => res.data)
        .catch((err) => {
            throw err;
        });
}

async function addOnePost(post) {
    try {
        const res = await http
            .post("/posts", post);
        return res.data;
    } catch (err) {
        console.log("Error in addOnePost:", err.response?.data || err.message);
        throw err;
    }
}

async function updatePost(id, data) {
    try {
        const res = await http
            .put(`/posts/${id}`, data);
        return res.data;
    } catch (error) {
        throw error;
    }
}

async function deletePost(id) {
    try {
        const res = await http
            .delete(`/posts/${id}`);
        return res.data;
    } catch (error) {
        throw error;
    }
}

function updatePostViews(postId) {
    return http
        .patch(`/posts/${postId}/views`)
        .then((res) => res.data)
        .catch((err) => {
            throw err;
        });
}

async function voteOnPost(postId, voteType) {
    try {
        const response = await http.post(`/posts/${postId}/vote`, { voteType });
        return response.data;
    } catch (error) {
        console.error(
            "Error voting on post:",
            error.response?.data || error.message
        );
        throw error;
    }
}


// Comments API
function getAllComments() {
    return http
        .get("/comments")
        .then((res) => res.data)
        .catch((error) => {
            throw error;
        });
}

function getOneComment(id) {
    return http
        .get(`/comments/${id}`)
        .then((res) => res.data)
        .catch((error) => {
            throw error;
        });
}

function addOneComment(comment) {
    return http
        .post("/comments", comment)
        .then((res) => res.data)
        .catch((error) => {
            throw error;
        });
}

async function updateComment(id, data) {
    try {
        const res = await http
            .put(`/comments/${id}`, data);
        return res.data;
    } catch (error) {
        throw error;
    }
}

async function deleteComment(id) {
    try {
        const res = await http
            .delete(`/comments/${id}`);
        return res.data;
    } catch (error) {
        throw error;
    }
}

async function voteOnComment(commentId, voteType) {
    try {
        const response = await http.post(`/comments/${commentId}/vote`, {
            voteType,
        });
        return response.data;
    } catch (error) {
        console.error(
            "Error voting on comment:",
            error.response?.data || error.message
        );
        throw error;
    }
}


// LinkFlairs API
function getAllLinkFlairs() {
    return http
        .get("/linkFlairs")
        .then((res) => res.data)
        .catch((error) => {
            throw error;
        });
}

function getOneLinkFlair(id) {
    return http
        .get(`/linkFlairs/${id}`)
        .then((res) => res.data)
        .catch((error) => {
            throw error;
        });
}

function addOneLinkFlair(linkFlair) {
    return http
        .post("/linkFlairs", linkFlair)
        .then((res) => res.data)
        .catch((error) => {
            throw error;
        });
}

// users
async function getAllUsers() {
    try {
        const res = await http.get("/users");
        return res.data;
    } catch (error) {
        console.error(
            "Error fetching all users:",
            error.response?.data || error.message
        );
        throw error;
    }
}

async function getCommunitiesByUser(displayName) {
    try {
        const res = await http.get(`/communities?createdBy=${displayName}`);
        return res.data;
    } catch (error) {
        console.error(
            `Error fetching communities created by user ${displayName}:`,
            error.response?.data || error.message
        );
        throw error;
    }
}

async function getPostsByUser(displayName) {
    try {
        const res = await http.get(`/posts?postedBy=${displayName}`);
        return res.data;
    } catch (error) {
        console.error(
            `Error fetching posts by user ${displayName}:`,
            error.response?.data || error.message
        );
        throw error;
    }
}

async function getCommentsByUser(displayName) {
    try {
        const res = await http.get(`/comments?commentedBy=${displayName}`);
        return res.data;
    } catch (error) {
        console.error(
            `Error fetching comments by user ${displayName}:`,
            error.response?.data || error.message
        );
        throw error;
    }
}

async function deleteUser(userId, displayName) {
    try {
        const res = await http.delete(`/users/${userId}/${displayName}`);
        return res.data;
    } catch (error) {
        console.error(
            `Error deleting user with ID ${userId} and displayName ${displayName}:`,
            error.response?.data || error.message
        );
        throw error;
    }
}

// JWT API
async function login(credentials) {
    console.log("POST /login: Sending login request with credentials", credentials);

    return http
        .post('/login', credentials) // API call
        .then((res) => {
            console.log("POST /login: Response data", res.data); // Log the response
            return res.data;
        })
        .catch((err) => {
            console.error("POST /login: Error", err.response?.data || err.message); // Log errors
            throw err;
        });
}


async function register(userData) {
    return http
        .post('/register', userData)
        .then(res => res.data)
        .catch((err) => { 
            console.error("Error registering user:", err);
            throw err;
        })
}

function setAuthToken(token) {
    if (token) {
        // Attach the token to every request's Authorization header
        http.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        // Remove the Authorization header when token is absent
        delete http.defaults.headers.common["Authorization"];
    }
}

const ApiService = {
    getAllCommunities: getAllCommunities,
    getOneCommunity: getOneCommunity,
    addOneCommunity: addOneCommunity,
    getAllPosts: getAllPosts,
    getOnePost: getOnePost,
    addOnePost: addOnePost,
    updatePostViews: updatePostViews,
    getAllComments: getAllComments,
    getOneComment: getOneComment,
    addOneComment: addOneComment,
    getAllLinkFlairs: getAllLinkFlairs,
    getOneLinkFlair: getOneLinkFlair,
    addOneLinkFlair: addOneLinkFlair,
    updatePost: updatePost,
    updateComment: updateComment,
    updateCommunity: updateCommunity,
    login: login,
    register: register,
    setAuthToken: setAuthToken,
    joinCommunity: joinCommunity,
    leaveCommunity: leaveCommunity,
    voteOnPost: voteOnPost,
    voteOnComment: voteOnComment,
    deleteCommunity: deleteCommunity,
    deleteComment: deleteComment,
    deletePost: deletePost,
    getAllUsers: getAllUsers,
    getCommunitiesByUser: getCommunitiesByUser,
    getPostsByUser: getPostsByUser,
    getCommentsByUser: getCommentsByUser,
    deleteUser: deleteUser,
};

export default ApiService;
