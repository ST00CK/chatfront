import ReactDOM from 'react-dom/client'
import Router from "./Router.tsx";
import "../public/css/index.css"

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <Router />,
  );
} else {
  console.error("Root element not found");
}