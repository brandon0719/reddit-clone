const request = require("supertest");
const app = require("./server"); // Adjust the path to your Express app

describe("Express Webserver", () => {
    test("Should listen on port 8000", async () => {
        const response = await request(app).get("/");
        expect(response.status).toBe(200);
    });
});
