const QUERY = /*GraphQL */ `
query Products($first: Int!) {
 shop { name }
 products(first: $first) {
 edges {
 node {
 id
 title
 handle
 }
 }
 }

}



`;
