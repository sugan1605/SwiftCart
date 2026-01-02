export const PRODUCTS_QUERY = /* GraphQL */ `
  query Products($first: Int!) {
    shop {
      name
    }
    products(first: $first) {
      nodes {
        id
        title
        handle
        description
        featuredImage {
          url
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 1) {
          nodes {
            id
          }
        }
      }
    }
  }
`;
