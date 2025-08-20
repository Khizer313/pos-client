import { gql } from "@apollo/client";

// Create product
export const CREATE_PRODUCT = gql`
  mutation CreateProduct($createProductInput: CreateProductInput!) {
    createProduct(createProductInput: $createProductInput) {
      productId
      name
      categoryAssigned
      price
      pieces
      status
      createdAt
    }
  }
`;

// Update product
export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($productId: Int!, $updateProductInput: CreateProductInput!) {
    updateProduct(productId: $productId, updateProductInput: $updateProductInput) {
      productId
      name
      categoryAssigned
      price
      pieces
      status
      createdAt
    }
  }
`;

// Delete product
export const DELETE_PRODUCT = gql`
  mutation RemoveProduct($productId: Int!) {
    removeProduct(productId: $productId) {
      productId
    }
  }
`;
