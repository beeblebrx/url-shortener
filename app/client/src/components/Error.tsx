interface ErrorProps {
    error: string
}

const ErrorMessage: React.FC<ErrorProps> = ({ error }) => {
 return (
      <div className="error">
        <strong>Error:</strong> {error}
      </div>
    );
}

export default ErrorMessage;