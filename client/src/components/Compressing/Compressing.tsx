import { useZip } from "src/contexts/zipContext";
import "./Compressing.scss";

function Compressing() {
  const { zipsInProgress } = useZip();

  let folderNaming = "folder";
  if (zipsInProgress > 1) folderNaming += "s";

  return (
    <div className="compressing">
      <div className="compressing__horizontal">
        <span>
          Compressing {zipsInProgress} {folderNaming}
        </span>
        <span>
          <span className="compressing__horizontal__dot">.</span>
          <span className="compressing__horizontal__dot">.</span>
          <span className="compressing__horizontal__dot">.</span>
        </span>
      </div>
      <div className="compressing__portrait">
        <span className="material-symbols-rounded">folder_zip</span>
        <div className="compressing__portrait__num">{zipsInProgress}</div>
      </div>
    </div>
  );
}

export default Compressing;
