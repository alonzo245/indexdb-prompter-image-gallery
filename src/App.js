import React, { useState, useEffect, useRef } from "react";
import { saveImage, getImages, deleteTable } from "./db";
import "./App.css";
import TextareaForm from "./JokesForm";

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [images, setImages] = useState([]);
  const [sliderActive, setSliderActive] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // jokes
  const [itemsInputValue, setItemsInputValue] = useState("");
  const [itemsCount, setItemsCount] = useState(0);
  const [itemsStoredData, setItemsStoredData] = useState([]);

  const sliderRef = useRef(null);

  useEffect(() => {
    console.log("render");

    const fetchImages = async () => {
      const storedImages = await getImages();
      setImages(storedImages);
    };
    fetchImages();
  }, [itemsStoredData]);

  useEffect(() => {
    if (sliderActive) {
      document.body.classList.add("slider-active");
      enterFullscreen();
    } else {
      document.body.classList.remove("slider-active");
      exitFullscreen();
    }

    return () => {
      document.body.classList.remove("slider-active");
      exitFullscreen();
    };
  }, [sliderActive]);

  useEffect(() => {
    const savedData = localStorage.getItem("textareaData");
    if (savedData) {
      setItemsStoredData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        setCurrentImageIndex((prevPosition) => {
          return prevPosition - 1 < 0 ? images.length - 1 : prevPosition - 1;
        });
      } else if (event.key === "ArrowRight") {
        setCurrentImageIndex((prevPosition) => {
          return images.length === prevPosition + 1 ? 0 : prevPosition + 1;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [images]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setSliderActive(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleFileChange = (event) => {
    setSelectedFiles(Array.from(event.target.files));
  };

  const handleSave = async () => {
    if (!selectedFiles.length) return;

    const promises = selectedFiles.map((file, index) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64Image = e.target.result;
          await saveImage(base64Image, images.length + index);
          resolve();
        };
        reader.readAsDataURL(file);
      });
    });

    await Promise.all(promises);
    const storedImages = await getImages();
    setImages(storedImages);
    setSelectedFiles([]);
  };

  const handleDeleteAll = async () => {
    await deleteTable();
    setImages([]);
  };

  const openSlider = (index) => {
    setCurrentImageIndex(index);
    setSliderActive(true);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const closeSlider = () => {
    setSliderActive(false);
  };

  const enterFullscreen = () => {
    const elem = sliderRef.current;
    if (elem && elem.requestFullscreen) {
      elem.requestFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  return (
    <div className="container">
      <TextareaForm
        inputValue={itemsInputValue}
        setInputValue={setItemsInputValue}
        itemsCount={itemsCount}
        setItemsCount={setItemsCount}
        storedData={itemsStoredData}
        setStoredData={setItemsStoredData}
      />

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
      />
      <button onClick={handleSave} disabled={!selectedFiles.length}>
        Save Images
      </button>
      <button
        onClick={handleDeleteAll}
        style={{ marginLeft: "10px", backgroundColor: "#d9534f" }}
      >
        Delete All Images
      </button>

      <div className="image-gallery">
        {images.map((item, index) => (
          <div key={index}>
            <img
              src={item.image}
              alt={`Stored ${index}`}
              onClick={() => openSlider(index)}
              style={{ cursor: "pointer" }}
            />
            <p className="preview-text">
              {item.order + 1} {" - "}
              {(itemsStoredData || [])?.[index] || "אין מידע"}
            </p>
          </div>
        ))}
      </div>

      {sliderActive && (
        <div className="image-slider" onClick={handleNextImage} ref={sliderRef}>
          <img
            src={images[currentImageIndex].image}
            alt={`Slide ${currentImageIndex}`}
          />
          <div className="image-text">
            {(itemsStoredData || [])?.[currentImageIndex] || "אין מידע"}
          </div>
          <div className="slider-buttons">
            <button
              className="close-slider"
              onClick={() => {
                closeSlider();
                exitFullscreen();
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
