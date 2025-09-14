import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

export default function ResourceGuidance() {
  const steps = [
    "/images/resource-guidance/1.png",
    "/images/resource-guidance/2.png",
    "/images/resource-guidance/3.png",
    "/images/resource-guidance/4.png",
    "/images/resource-guidance/5.png",
    "/images/resource-guidance/6.png",
    "/images/resource-guidance/7.png",
    "/images/resource-guidance/8.png",
  ];

  return (
    <div className="resource-guidance-wrapper d-flex justify-content-center align-items-center">
      <div
        id="carouselIndicators"
        className="carousel slide shadow-lg rounded"
        data-bs-ride="carousel"
      >
        <div className="carousel-indicators">
          {steps.map((_, index) => (
            <button
              key={index}
              type="button"
              data-bs-target="#carouselIndicators"
              data-bs-slide-to={index}
              className={index === 0 ? "active" : ""}
              aria-current={index === 0 ? "true" : undefined}
              aria-label={`Slide ${index + 1}`}
            ></button>
          ))}
        </div>

        <div className="carousel-inner">
          {steps.map((img, index) => (
            <div
              key={index}
              className={`carousel-item ${index === 0 ? "active" : ""}`}
            >
              <img
                src={img}
                className="d-block w-100"
                alt={`Step ${index + 1}`}
              />
            </div>
          ))}
        </div>

        <button
          className="carousel-control-prev custom-arrow"
          type="button"
          data-bs-target="#carouselIndicators"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button
          className="carousel-control-next custom-arrow"
          type="button"
          data-bs-target="#carouselIndicators"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>

      <style>
        {`
          .resource-guidance-wrapper {
            background-color: #f0f2f5;
            min-height: 90vh;
            padding: 40px 20px;
          }

          #carouselIndicators {
            max-width: 1200px;
            width: 100%;
          }

          #carouselIndicators img {
            border-radius: 12px;
            width: 100%;
            height: 80vh;
            object-fit: cover;
          }

          /* Make arrows more visible and push them outward */
          .carousel-control-prev-icon,
          .carousel-control-next-icon {
            background-color: #2659a7;
            border-radius: 50%;
            padding: 18px;
            filter: brightness(1.2) contrast(1.2);
          }

          .carousel-control-prev {
            left: -60px;
          }
          .carousel-control-next {
            right: -60px;
          }

          /* Adjust for smaller screens */
          @media (max-width: 1024px) {
            #carouselIndicators img {
              object-fit: contain !important;
              background-color: #ffffffff;
            }
            .carousel-control-prev {
              left: -40px;
            }
            .carousel-control-next {
              right: -40px;
            }
          }

          @media (max-width: 768px) {
            #carouselIndicators img {
              height: 60vh;
            }
          }

          @media (max-width: 480px) {
            #carouselIndicators img {
              height: 50vh;
            }
            .carousel-control-prev {
              left: -5px;
            }

            .carousel-control-next {
              right: -5px;
            }
          }
        `}
      </style>
    </div>
  );
}
