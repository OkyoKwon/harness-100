import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardBody, CardFooter } from "../card";

describe("Card", () => {
  it("renders children", () => {
    // Arrange & Act
    render(<Card>Card content</Card>);

    // Assert
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("applies hoverable classes when hoverable is true", () => {
    // Arrange & Act
    render(<Card hoverable>Hoverable</Card>);

    // Assert
    expect(screen.getByText("Hoverable").className).toContain("hover:-translate-y-1");
  });

  it("does not apply hoverable classes by default", () => {
    // Arrange & Act
    render(<Card>Static</Card>);

    // Assert
    expect(screen.getByText("Static").className).not.toContain("hover:-translate-y-1");
  });

  it("applies custom className", () => {
    // Arrange & Act
    render(<Card className="custom">Content</Card>);

    // Assert
    expect(screen.getByText("Content").className).toContain("custom");
  });
});

describe("CardHeader", () => {
  it("renders children", () => {
    render(<CardHeader>Header</CardHeader>);
    expect(screen.getByText("Header")).toBeInTheDocument();
  });
});

describe("CardBody", () => {
  it("renders children", () => {
    render(<CardBody>Body</CardBody>);
    expect(screen.getByText("Body")).toBeInTheDocument();
  });
});

describe("CardFooter", () => {
  it("renders children", () => {
    render(<CardFooter>Footer</CardFooter>);
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });
});
