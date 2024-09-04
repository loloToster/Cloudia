import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import type { PDFDocumentProxy } from "pdfjs-dist";

import { PreviewProps } from "../ItemPreview";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "./Pdf.scss";

// todo: use local
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function Pdf(props: PreviewProps) {
  const { item } = props;

  const [numPages, setNumPages] = useState(1);
  const [curPage, setCurPage] = useState(1);

  const onDocumentLoadSuccess = (proxy: PDFDocumentProxy) => {
    setNumPages(proxy.numPages);
  };

  const handlePageChange = (offset: number) => {
    setCurPage((prev) => Math.min(Math.max(prev + offset, 1), numPages));
  };

  // SIZE
  const [height, setHeight] = useState(100);
  const [width, setWidth] = useState(100);
  const observedDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!observedDiv.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (!observedDiv.current) return;

      if (observedDiv.current.offsetHeight !== height) {
        setHeight(observedDiv.current.offsetHeight);
      }

      if (observedDiv.current.offsetWidth !== width) {
        setWidth(observedDiv.current.offsetWidth);
      }
    });

    resizeObserver.observe(observedDiv.current);

    return () => resizeObserver.disconnect();
  }, [height, width, observedDiv]);

  return (
    <div className="pre-pdf">
      <div className="pre-pdf__inner" ref={observedDiv}>
        <div className="pre-pdf__inner__inner">
          <Document
            file={`/cdn/${item.id}`}
            onLoadSuccess={onDocumentLoadSuccess}
          >
            <Page
              pageNumber={curPage}
              height={height < width ? height : undefined}
              width={width < height ? width : undefined}
            />
          </Document>
        </div>
      </div>
      <div className="pre-pdf__pages">
        <button onClick={() => handlePageChange(-1)} className="left">
          <span className="material-symbols-rounded">arrow_forward_ios</span>
        </button>
        <div>{`${curPage} of ${numPages}`}</div>
        <button onClick={() => handlePageChange(1)} className="right">
          <span className="material-symbols-rounded">arrow_forward_ios</span>
        </button>
      </div>
    </div>
  );
}

export default Pdf;
