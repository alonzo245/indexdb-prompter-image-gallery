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
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [itemsFontSize, setItemsFontSize] = useState(40);

  const sliderRef = useRef(null);

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
    if (images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    } else {
      setCurrentItemIndex(
        (prevIndex) => (prevIndex + 1) % itemsStoredData.length
      );
    }
  };

  const closeSlider = () => {
    setSliderActive(false);
  };

  const enterFullscreen = () => {
    // const elem = sliderRef.current;
    // if (elem && elem.requestFullscreen) {
    //   elem.requestFullscreen();
    // }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const increaseItemsFontSize = (e) => {
    e.stopPropagation();

    setItemsFontSize((prevSize) => prevSize + 2);
  };

  const decreaseItemsFontSize = (e) => {
    e.stopPropagation();
    setItemsFontSize((prevSize) => {
      console.log(prevSize);

      return itemsFontSize - 2 || 20;
    });
  };

  useEffect(() => {
    const savedFontSize = parseInt(localStorage.getItem("itemsFontSize"));
    if (savedFontSize) {
      setItemsFontSize(savedFontSize);
    }
  }, []);

  useEffect(() => {
    console.log("itemsFontSize", itemsFontSize);

    localStorage.setItem("itemsFontSize", itemsFontSize);
  }, [itemsFontSize]);

  useEffect(() => {
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
        {(images.length > 0 ? images : itemsStoredData).map((item, index) => (
          <div key={index} onClick={() => openSlider(index)}>
            {images.length > 0 && (
              <img
                src={item.image}
                alt={`Stored ${index}`}
                style={{ cursor: "pointer" }}
              />
            )}
            <p className="preview-text">
              {images.length > 0 ? `${item.order + 1} - ` : `${index + 1} - `}
              {(itemsStoredData || [])?.[index] || "אין מידע"}
            </p>
          </div>
        ))}
      </div>

      {sliderActive && (
        <div className="image-slider" onClick={handleNextImage} ref={sliderRef}>
          {images.length > 0 && (
            <img
              src={images[currentImageIndex].image}
              alt={`Slide ${currentImageIndex}`}
            />
          )}
          <div
            dangerouslySetInnerHTML={{
              __html:
                (itemsStoredData || [])?.[
                  images.length > 0 ? currentImageIndex : currentItemIndex
                ]
                  .split("\n")
                  .map((line) => `<p>${line}</p>`)
                  .join("") || "אין מידע",
            }}
            className="image-text"
            style={{ fontSize: `${itemsFontSize}px` }}
          />
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
            <button className="decrease-slider" onClick={decreaseItemsFontSize}>
              -
            </button>
            <button className="increase-slider" onClick={increaseItemsFontSize}>
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
