import { FullFileBrowser, ChonkyActions } from "chonky";
import React, { useEffect, useState } from "react";

import FileService from "../services/FileService"; // Make sure to import your file service

export const FileManager = () => {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState(""); // Track the current folder path
  const [folderChain, setFolderChain] = useState([
    { id: "root", name: "Root", isDir: true },
  ]);

  useEffect(() => {
    fetchFiles(currentPath);
  }, []);

  const handleFileOpen = (file) => {
    if (file.isDir) {
      // If it is a directory, update the current path and folder chain
      const newPath = currentPath ? `${currentPath}/${file.name}` : file.name;
      setCurrentPath(newPath);

      setFolderChain((prevChain) => [
        ...prevChain,
        { id: newPath, name: file.name, isDir: true },
      ]);
      fetchFiles(newPath);
    } else {
      // Otherwise, handle as a regular file (e.g., download)
      alert(`Opening file: ${file.name}`);
    }
  };

  // Handle moving up one directory level
  const goUpDirectory = () => {
    if (!currentPath) return; // Already in the root directory, can't go up further

    const newChain = folderChain.slice(0, -1); // Remove the last folder from the chain
    const newPath =
      newChain.length > 1
        ? newChain
            .slice(1)
            .map((folder) => folder.name)
            .join("/")
        : "";
    setCurrentPath(newPath);
    setFolderChain(newChain);
    fetchFiles(newPath);
  };

  const handleFolderChainClick = (folderIndex) => {
    if (folderIndex < folderChain.length - 1) {
      const newChain = folderChain.slice(0, folderIndex + 1);
      const newPath = newChain
        .slice(1)
        .map((folder) => folder.name)
        .join("/");
      setCurrentPath(newPath);
      setFolderChain(newChain);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0]; // Get the first selected file
    if (!file) return;

    try {
      await FileService.uploadFile(file, currentPath); // Send file to backend
      fetchFiles(currentPath); // Refresh the file list after successful upload
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleDownload = async (file) => {
    try {
      const blob = await FileService.downloadFile(currentPath === "" ? file.id : `${currentPath}/${file.id}`);
      // Create a link element to trigger the download
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", currentPath === "" ? file.id : `${currentPath}/${file.id}`); 
      document.body.appendChild(link);
      link.click(); // Trigger the download
      link.remove(); // Clean up the DOM
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const handleActionWrapper = (event) => {
    switch (event.id) {
      case ChonkyActions.OpenParentFolder.id:
        goUpDirectory();
        break;
      case ChonkyActions.OpenFiles.id:
        if (event.payload && event.payload.targetFile) {
          handleFileOpen(event.payload.targetFile);
        }
        break;
      case ChonkyActions.DownloadFiles.id:
        if (event.state && event.state.selectedFiles) {
          event.state.selectedFiles.forEach((file) => handleDownload(file));
        }
        break;
      case ChonkyActions.UploadFiles.id:
        document.getElementById("file-input").click();
        break;
      case ChonkyActions.DeleteFiles.id:
        if (event.state && event.state.selectedFiles) {
          FileService.deleteFiles(
            event.state.selectedFiles.map((sf) => currentPath === "" ? sf.id : `${currentPath}/${sf.id}`)
          ).then(() => fetchFiles(currentPath));
        }
        break;

      default:
        break;
    }
  };

  // Fetch files from your backend
  const fetchFiles = async (path) => {
    try {
      const fetchedFiles = await FileService.getAllFiles(path);

      const fileItems = fetchedFiles.map((file) => ({
        id: file.id, // This should be unique for each file
        name: file.name,
        isDir: file.dir, // Set to true if you have directories
      }));
      setFiles(fileItems);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const myFileActions = [
    ChonkyActions.UploadFiles,
    ChonkyActions.DownloadFiles,
    ChonkyActions.DeleteFiles,
    ChonkyActions.OpenFiles,
  ];
  return (
    <div style={{ height: 600 }}>
      <input
        id="file-input"
        type="file"
        style={{ display: "none" }}
        onChange={handleUpload} // File selection triggers the upload handler
      />
      <FullFileBrowser
        disableDragAndDrop={true}
        files={files}
        fileActions={myFileActions}
        folderChain={folderChain}
        onFileAction={handleActionWrapper}
        onFolderChainClick={(folder) =>
          handleFolderChainClick(folderChain.indexOf(folder))
        }
      />
    </div>
  );
};
