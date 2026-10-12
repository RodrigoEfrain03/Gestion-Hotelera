import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Error de interfaz", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <main className="fatal-state">
        <div>
          <span className="fatal-state__icon">!</span>
          <h1>La interfaz encontró un error</h1>
          <p>Tus datos no se han borrado. Recarga la aplicación para continuar.</p>
          <button className="primary-button" onClick={() => window.location.reload()}>Recargar aplicación</button>
        </div>
      </main>;
    }
    return this.props.children;
  }
}
