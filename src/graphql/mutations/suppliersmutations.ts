import { gql } from '@apollo/client';

export const CREATE_SUPPLIER = gql`
  mutation CreateSupplier($createSupplierInput: CreateSupplierInput!) {
    createSupplier(createSupplierInput: $createSupplierInput) {
      supplierId
      name
      phone
      balance
      status
      createdAt
    }
  }
`;

export const UPDATE_SUPPLIER = gql`
  mutation UpdateSupplier($supplierId: Int!, $updateSupplierInput: CreateSupplierInput!) {
    updateSupplier(supplierId: $supplierId, updateSupplierInput: $updateSupplierInput) {
      supplierId
      name
      phone
      balance
      status
      createdAt
    }
  }
`;

export const DELETE_SUPPLIER = gql`
  mutation RemoveSupplier($supplierId: Int!) {
    removeSupplier(supplierId: $supplierId) {
      supplierId
    }
  }
`;
