describe("Login Page", () => {
  it('should log in and check for "book-a-room" class', () => {
    // Visit the login page
    cy.visit("localhost:3000");

    // Fill in the email and password inputs
    cy.get('input[name="email"]').type("kein@admin.de");
    cy.get('input[name="password"]').type("Test257!");

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Wait for 0.5 seconds
    cy.wait(500);

    // Check if the page has the "book-a-room" class
    cy.get("div").should("have.class", "book-a-room");
    cy.get("div").should("have.class", "fc-daygrid-body");
  });
});
