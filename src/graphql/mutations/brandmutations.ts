import { gql } from '@apollo/client';

export const CREATE_BRAND = gql`
  mutation CreateBrand($createBrandInput: CreateBrandInput!) {
    createBrand(createBrandInput: $createBrandInput) {
      brandId
      name
      status
      createdAt
    }
  }
`;

export const UPDATE_BRAND = gql`
  mutation UpdateBrand($brandId: Int!, $updateBrandInput: CreateBrandInput!) {
    updateBrand(brandId: $brandId, updateBrandInput: $updateBrandInput) {
      brandId
      name
      status
      createdAt
    }
  }
`;

export const DELETE_BRAND = gql`
  mutation RemoveBrand($brandId: Int!) {
    removeBrand(brandId: $brandId) {
      brandId
    }
  }
`;
