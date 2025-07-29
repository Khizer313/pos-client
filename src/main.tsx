import { lazy, StrictMode, Suspense, type JSX } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Dashboard from './pages/Dashboard/Dashboard.tsx'
import Home from './pages/Home/Home.tsx'


// import SalesReport from './pages/reports/SalesReport.tsx'
// import PurchaseReport from './pages/reports/PurchaseReport.tsx'
// import StockReport from './pages/reports/StockReport.tsx'
// import PaymentReport from './pages/reports/PaymentInReport.tsx'
// import PurchaseReturnReport from './pages/reports/PurchaseReturnReport.tsx'
// import PaymentOutReport from './pages/reports/PaymentOutReport.tsx'
// import CustomerLedger from './pages/reports/CustomerLedger.tsx'
// import ProfitLossReport from './pages/reports/ProfitLossReport.tsx'
// import QuotationReport from './pages/reports/QuotationReport.tsx'
// import SalesReturnReport from './pages/reports/SalesReturnReport.tsx'
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ToastProvider } from './components/ToastContext.tsx'





const Customers = lazy(() => import('./pages/parties/customers/Customers.tsx'))
const Suppliers = lazy(() => import('./pages/parties/suppliers/Suppliers.tsx'));


const Brands = lazy(() => import('./pages/productMangaer/Brand.tsx'));
const Categories = lazy(() => import('./pages/productMangaer/Categories.tsx'));
const Variations = lazy(() => import('./pages/productMangaer/Variations.tsx'));
const Products = lazy(() => import('./pages/productMangaer/Products.tsx'));


const Purchases = lazy(() => import('./pages/purchase/Purchase.tsx'));
const PurchaseReturns = lazy(() => import('./pages/purchase/PurchaseReturnOrDebitNote.tsx'));
const PaymentOut = lazy(() => import('./pages/purchase/PaymentOut.tsx'));

const Sales = lazy(() => import('./pages/sales/Sales.tsx'));
const SaleReturns = lazy(() => import('./pages/sales/SalesReturnOrCreditNote.tsx'));
const PaymentIn = lazy(() => import('./pages/sales/PaymentIn.tsx'));
const QuotationOrEstimate = lazy(() => import('./pages/sales/QuotationOrEstimate.tsx'));










// Helper to wrap lazy-loaded components
const withSuspense = (Component: React.LazyExoticComponent<() => JSX.Element>) => (
  <Suspense fallback={<div className="text-center mt-10 text-lg">Loading...</div>}>
    <Component />
  </Suspense>
)


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
      { path: '/customers', element: withSuspense(Customers) },
      { path: '/suppliers', element: withSuspense(Suppliers) },

      // product manager section pages
      { path: '/brands', element: withSuspense(Brands) },
      { path: '/categories', element: withSuspense(Categories) },
      { path: '/variations', element: withSuspense(Variations) },
      { path: '/products', element: withSuspense(Products) },

      // purchases section pages
      { path: '/purchases', element: withSuspense(Purchases) },
      { path: '/purchase-returns', element: withSuspense(PurchaseReturns) },
      {path: '/paymentout', element: withSuspense(PaymentOut)},
      // sales section pages
      { path: '/sales', element: withSuspense(Sales) },
      { path: '/sale-returns', element: withSuspense(SaleReturns) },
      {path: '/paymentin', element: withSuspense(PaymentIn)},
      {path: '/estimate', element: withSuspense(QuotationOrEstimate)},

      // reports section pages
      // {path: '/salesreport', element: <SalesReport/>},
      // {path: '/purchasereport', element: <PurchaseReport/>},
      // {path: '/stockreport', element: <StockReport/>},
      // {path: '/paymentreport', element: <PaymentReport/>},
      // {path: '/purchasereturnreport', element: <PurchaseReturnReport/>},
      // {path: '/paymentoutreport', element: <PaymentOutReport/>},
      // {path: '/customerledger', element: <CustomerLedger/>},
      // {path: '/profitlossreport', element: <ProfitLossReport/>},
      // {path: '/quotationreport', element: <QuotationReport/>},
      // {path: '/salesreturnreport', element: <SalesReturnReport/>},
    ]
  }
])

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <LocalizationProvider dateAdapter={AdapterDateFns}>

      <ApolloProvider client={client}>
        <ToastProvider>

        <RouterProvider router={router} />
        </ToastProvider>
      </ApolloProvider>
      </LocalizationProvider>
    </ErrorBoundary>
  </StrictMode>
);