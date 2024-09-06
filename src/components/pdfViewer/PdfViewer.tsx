import { useEffect, useState } from "react";
import { Document, Page } from "react-pdf";
import { PDFDocument } from "pdf-lib";

interface PdfViewerProps {
  fileUrl: string | null;
}

function PdfViewer({ fileUrl }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);

  useEffect(() => {
    // Reset page number when the file URL changes
    setPageNumber(1);
  }, [fileUrl]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  // Toggle selection of a page
  const togglePageSelection = (pageIndex: number) => {
    setSelectedPages((prevSelected) =>
      prevSelected.includes(pageIndex)
        ? prevSelected.filter((page) => page !== pageIndex)
        : [...prevSelected, pageIndex]
    );
  };

  // Generate a new PDF with selected pages
  const createNewPDFFile = async (url: string) => {
    try {
      // Fetch and load PDF
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`Failed to fetch PDF file. Status: ${response.status}`);

      const fileArrayBuffer = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileArrayBuffer);

      // Create a new PDF document
      const newPdfDoc = await PDFDocument.create();

      // Add selected pages to the new PDF document
      for (const pageIndex of selectedPages) {
        console.log(`Processing page index: ${pageIndex}`);
        try {
          const [page] = await newPdfDoc.copyPages(pdfDoc, [pageIndex]);
          newPdfDoc.addPage(page);
        } catch (pageError) {
          console.error(`Error copying page ${pageIndex}:`, pageError);
        }
      }

      // Save the new PDF document
      const pdfBytes = await newPdfDoc.save();
      console.log("Saved new PDF bytes:", pdfBytes);

      // Create and return new file
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const newFile = new File([blob], "new-file.pdf");
      return newFile;
    } catch (error: any) {
      console.error("Error processing or uploading file:", error);
      alert(error.message);
    }
  };

  // Handle click to create new PDF
  const handleCreateNewPDF = async () => {
    if (fileUrl) {
      const newFile = await createNewPDFFile(fileUrl);
      if (newFile) {
        // Handle the newly created PDF file (e.g., download)
        const url = URL.createObjectURL(newFile);
        const a = document.createElement("a");
        a.href = url;
        a.download = newFile.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } else {
      alert("No PDF file URL provided.");
    }
  };

  return (
    <div className="mt-[50px] p-[50px] bg-[#dedede]">
      <p>
        Page {pageNumber} of {numPages}
      </p>
      {fileUrl ? (
        <div>
          <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
            {Array.from({ length: numPages ?? 0 }, (_, index) => (
              <div key={index}>
                <input
                  type="checkbox"
                  checked={selectedPages.includes(index)} // index is 0-based
                  onChange={() => togglePageSelection(index)}
                />
                <Page
                  key={index + 1}
                  pageNumber={index + 1} // pageNumber is 1-based for display
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </div>
            ))}
          </Document>
          <button
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
            onClick={handleCreateNewPDF}
          >
            Create New PDF with Selected Pages
          </button>
        </div>
      ) : (
        <p>No PDF selected</p>
      )}
    </div>
  );
}

export default PdfViewer;
