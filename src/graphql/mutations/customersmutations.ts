import { gql } from '@apollo/client';

export const CREATE_CUSTOMER = gql`
  mutation CreateCustomer($createCustomerInput: CreateCustomerInput!) {
    createCustomer(createCustomerInput: $createCustomerInput) {
    customerId
      name
      phone
      balance
      status
      createdAt
    }
  }
`;






// ✅ UPDATE
export const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($customerId: Int!, $updateCustomerInput: CreateCustomerInput!) {
    updateCustomer(customerId: $customerId, updateCustomerInput: $updateCustomerInput) {
      customerId
      name
      phone
      balance
      status
      createdAt
    }
  }
`;

// ✅ DELETE
export const DELETE_CUSTOMER = gql`
  mutation RemoveCustomer($customerId: Int!) {
    removeCustomer(customerId: $customerId) {
      customerId
    }
  }
`;
