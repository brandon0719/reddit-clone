import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Banner from "./Banner"; // Adjust the path to your component

describe("React Create Post Button", () => {
    test("Create Post button is disabled for guests and enabled for registered users", () => {
        // Render as a guest
        render(<Banner user={null} />);
        const guestButton = screen.getByRole("button", {
            name: /create post/i,
        });
        expect(guestButton).toBeDisabled();

        // Render as a registered user
        render(<Banner user={{ displayName: "RegisteredUser" }} />);
        const registeredButton = screen.getByRole("button", {
            name: /create post/i,
        });
        expect(registeredButton).toBeEnabled();
    });
});
