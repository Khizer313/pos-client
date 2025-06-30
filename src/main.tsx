import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Dashboard from './pages/Dashboard/Dashboard.tsx'
import Home from './pages/Home/Home.tsx'
import Customers from './pages/parties/customers/Customers.tsx'
import Suppliers from './pages/parties/suppliers/Suppliers.tsx'
import Brands from './pages/productMangaer/Brand.tsx'
import Categories from './pages/productMangaer/Categories.tsx'
import Variations from './pages/productMangaer/Variations.tsx'
import Products from './pages/productMangaer/Products.tsx'
import Purchases from './pages/purchase/Purchase.tsx'
import PurchaseReturnOrDebitNote from './pages/purchase/PurchaseReturnOrDebitNote.tsx'
import PaymentOut from './pages/purchase/PaymentOut.tsx'
import Sales from './pages/sales/Sales.tsx'
import SalesReturnOrCreditNote from './pages/sales/SalesReturnOrCreditNote.tsx'
import PaymentIn from './pages/sales/PaymentIn.tsx'
import QuotationOrEstimate from './pages/sales/QuotationOrEstimate.tsx'
import SalesReport from './pages/reports/SalesReport.tsx'
import PurchaseReport from './pages/reports/PurchaseReport.tsx'
import StockReport from './pages/reports/StockReport.tsx'
import PaymentReport from './pages/reports/PaymentInReport.tsx'
import PurchaseReturnReport from './pages/reports/PurchaseReturnReport.tsx'
import PaymentOutReport from './pages/reports/PaymentOutReport.tsx'
import CustomerLedger from './pages/reports/CustomerLedger.tsx'
import ProfitLossReport from './pages/reports/ProfitLossReport.tsx'
import QuotationReport from './pages/reports/QuotationReport.tsx'
import SalesReturnReport from './pages/reports/SalesReturnReport.tsx'
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

const client = new ApolloClient({
  uri: "http://localhost:3000/graphql",
  cache: new InMemoryCache(),
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    children: [
      {path: '/', element: <Home/>},
      {path: '/dashboard', element: <Dashboard/>},

      // parties section pages
      {path: '/customers', element: <Customers/>},
      {path: '/suppliers', element: <Suppliers/>},

      // product manager section pages
      {path: '/brands', element: <Brands/>},
      {path: '/categories', element: <Categories/>},
      {path: '/variations', element: <Variations/>},
      {path: '/products', element: <Products/>},

      // purchases section pages
      {path: '/purchases', element: <Purchases/>},
      {path: '/purchasereturn', element: <PurchaseReturnOrDebitNote/>},
      {path: '/paymentout', element: <PaymentOut/>},
      // sales section pages
      {path: '/sales', element: <Sales/>},
      {path: '/salesreturn', element: <SalesReturnOrCreditNote/>},
      {path: '/paymentin', element: <PaymentIn/>},
      {path: '/estimate', element: <QuotationOrEstimate/>},

      // reports section pages
      {path: '/salesreport', element: <SalesReport/>},
      {path: '/purchasereport', element: <PurchaseReport/>},
      {path: '/stockreport', element: <StockReport/>},
      {path: '/paymentreport', element: <PaymentReport/>},
      {path: '/purchasereturnreport', element: <PurchaseReturnReport/>},
      {path: '/paymentoutreport', element: <PaymentOutReport/>},
      {path: '/customerledger', element: <CustomerLedger/>},
      {path: '/profitlossreport', element: <ProfitLossReport/>},
      {path: '/quotationreport', element: <QuotationReport/>},
      {path: '/salesreturnreport', element: <SalesReturnReport/>},
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <RouterProvider router={router} />
    </ApolloProvider>
  </StrictMode>
)