import { gql } from "@apollo/client";



// Create category
export const CREATE_CATEGORY = gql`
  mutation CreateCategory($createCategoryInput: CreateCategoryInput!) {
    createCategory(createCategoryInput: $createCategoryInput) {
      categoryId
      name
      status
      createdAt
    }
  }
`;

// Update category
export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($categoryId: Int!, $updateCategoryInput: CreateCategoryInput!) {
    updateCategory(categoryId: $categoryId, updateCategoryInput: $updateCategoryInput) {
      categoryId
      name
      status
      createdAt
    }
  }
`;

// Delete category
export const DELETE_CATEGORY = gql`
  mutation RemoveCategory($categoryId: Int!) {
    removeCategory(categoryId: $categoryId) {
      categoryId
    }
  }
`;
