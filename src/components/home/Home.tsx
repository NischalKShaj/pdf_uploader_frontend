// <============================ main home page of for the user ===============================>

// importing the required modules
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { pdfjs } from "react-pdf";
import { AppState } from "../../store";
import PdfViewer from "../pdfViewer/PdfViewer";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const Home = () => {
  const navigate = useNavigate();
  const user = AppState((state) => state.user);
  const isAuthorized = AppState((state) => state.isAuthorized);
  const id = user?._id;
  const [loading, setLoading] = useState(true);
  const [fileData, setFileData] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useLayoutEffect(() => {
    if (!isAuthorized) {
      navigate("/");
    }
  });

  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    console.log("token", token);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      if (response.status === 202) {
        setUploadedFiles(response.data.data.uploaded_file);
        console.log("user", response.data.data.uploaded_file);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.currentTarget.files?.[0];
    if (target) {
      setFileData(target);
    }
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!fileData) {
      alert("No file selected for uploading");
      return;
    }

    const token = localStorage.getItem("access_token");

    const formData = new FormData();
    formData.append("pdf", fileData);

    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_BASE_URL}/uploads/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      if (response.status === 202) {
        setFileData(null);
        setUploadedFiles(response.data.data.uploaded_file);
        alert("pdf uploaded successfully");

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error("error uploading", error);
      alert("Error uploading the file");
    }
  };

  const handleShowPdf = (file: string) => {
    setSelectedFile(`${process.env.REACT_APP_BASE_URL}/pdf/${file}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-custom w-full flex justify-center items-center min-h-screen">
      <div className="flex flex-col justify-center items-center outline-dotted">
        <h6>welcome {user?.username}</h6>
        <p>Upload your PDF here</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
        />
        <button
          className="bg-blue-500 text-white"
          type="button"
          onClick={handleSubmit}
        >
          submit
        </button>
      </div>
      <div className="mt-8">
        <h3>Uploaded PDFs:</h3>
        <ul>
          {uploadedFiles.map((file, index) => (
            <li key={index}>
              <p className="text-lg p-2 ">{file}</p>
              <a
                href={`${process.env.REACT_APP_BASE_URL}/pdf/${file}`} // Adjust the path as needed
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                {file}
              </a>
              <button
                className="bg-blue-500 text-white"
                onClick={() => handleShowPdf(file)}
              >
                show pdf
              </button>
            </li>
          ))}
        </ul>
      </div>
      <PdfViewer fileUrl={selectedFile} />
    </div>
  );
};

export default Home;
