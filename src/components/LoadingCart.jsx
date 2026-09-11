export default function LoadingCard() {
  return (
    <article className="card loading-card">
      <div className="loading-image" />

      <div className="card-body">
        <div className="loading-line large" />
        <div className="loading-line" />
        <div className="loading-line small" />
      </div>
    </article>
  )
}