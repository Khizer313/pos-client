// src/graphql/queries/customers.ts
import { gql } from "@apollo/client";

// export const GET_CUSTOMERS = gql`
//   query GetCustomers {
//     customers {
//       name
//       phone
//       createdAt
//       balance
//       status
//     }
//   }
// `;



// ✅ FIXED
export const GET_CUSTOMERS_PAGINATED = gql`
  query GetCustomersPaginated(
    $page: Int!,
    $limit: Int!,
    $search: String,
    $status: String,
    $startDate: String,
    $endDate: String
  ) {
    customersPaginated(
      page: $page,
      limit: $limit,
      search: $search,
      status: $status,
      startDate: $startDate,
      endDate: $endDate
    ) {
      data {
      customerId
        name
        phone
        balance
        status
        createdAt
      }
      total
    }
  }
`;

