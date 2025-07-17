import { gql } from '@apollo/client';

export const CREATE_CUSTOMER = gql`
  mutation CreateCustomer($createCustomerInput: CreateCustomerInput!) {
    createCustomer(createCustomerInput: $createCustomerInput) {
      name
      phone
      balance
      status
      createdAt
    }
  }
`;






export const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($phone: String!, $updateCustomerInput: CreateCustomerInput!) {
    updateCustomer(phone: $phone, updateCustomerInput: $updateCustomerInput) {
      name
      phone
      balance
      status
      createdAt
    }
  }
`;



export const DELETE_CUSTOMER = gql`
  mutation RemoveCustomer($phone: String!) {
    removeCustomer(phone: $phone) {
      phone
    }
  }
`;
