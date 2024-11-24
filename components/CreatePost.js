import React, { useState } from 'react'
import { BsFileImageFill, BsFillCameraVideoFill } from 'react-icons/bs'
import { FiRefreshCw } from 'react-icons/fi'

const CreatePost = ({ savePost, getAllPosts, walletAddress }) => {
  const [input, setInput] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [videoHash, setVideoHash] = useState('')

  const style = {
    wrapper: `w-[100%] flex mt-[1rem] flex-col rounded-[0.6rem] bg-[#252526] p-2 pt-4 pb-0 shadow-[0px 5px 7px -7px rgba(0, 0, 0, 0.75)]`,
    formContainer: `flex pb-3 mb-2 border-b border-[#404041]`,
    profileImage: `rounded-full object-cover`,
    form: `flex-1 flex items-center`,
    input: `flex-1 py-[0.6rem] px-[1rem] mx-[0.6rem] rounded-full bg-[#3a3b3d] outline-none border-none text-white`,
    actionsContainer: `flex justify-evenly pb-2`,
    actionButton: `flex flex-1 items-center justify-center p-2 text-[#555] cursor-pointer hover:bg-[#404041] rounded-[0.5rem] transition-all duration-300 ease-in-out`,
    actionButtonTitle: `font-semibold ml-[0.6rem] text-lg text-[#afb3b8]`,
    videoCamIcon: `text-red-500`,
    photoIcon: `text-green-500`,
    refreshIcon: `text-blue-500`,
  }

  // Handle video file selection
  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    setVideoFile(file)

    // Generate SHA512 hash of the video content using SubtleCrypto
    const hash = await generateHash(file)
    setVideoHash(hash)
  }

  // Generate SHA-512 hash from the file using SubtleCrypto
  const generateHash = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result
          // Use SubtleCrypto to generate SHA-512 hash
          const hashBuffer = await crypto.subtle.digest('SHA-512', arrayBuffer)

          // Convert the ArrayBuffer to a hexadecimal string
          const hashArray = Array.from(new Uint8Array(hashBuffer))
          const hexHash = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('')

          resolve(hexHash)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = (error) => reject(error)
      reader.readAsArrayBuffer(file)  // Read the video as an ArrayBuffer
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    // Ensure there is either a video or text input before submitting
    if (!videoFile && !input.trim()) {
      alert("Please enter some text or upload a video.")
      return
    }

    let postContent = videoHash
    let postText = input

    if (videoFile) {
      // Upload the video file to your server
      await uploadVideoToServer(videoFile)
      postContent = videoHash  // Set hash as content
      postText = `Video Hash: ${videoHash}` // Use the video hash as the text
    }

    // Save the post
    await savePost({
      posterName: walletAddress,
      text: postText,  // Text containing hash or input
      content: postContent,  // Hash of the video as content
    })

    // Reset input and file state
    setInput('')
    setVideoFile(null)
    setVideoHash('')
  }

  // Simulate uploading the video to the server
  const uploadVideoToServer = async (file) => {
    const formData = new FormData()
    formData.append('video', file)

    // Assuming you have an API endpoint for uploading videos
    const response = await fetch('/api/upload-video', {
      method: 'POST',
      body: formData,
    })

    if (response.ok) {
      console.log('Video uploaded successfully')
    } else {
      console.error('Failed to upload video')
    }
  }

  return (
    <div className={style.wrapper}>
      <div className={style.formContainer}>
        {/* Display wallet address as profile image */}
<input
  value={input}
  onChange={(e) => setInput(e.target.value)}
  className={style.input}
  placeholder={`What is on your mind, ${walletAddress || 'Loading...'}`}
/>

        <form className={style.form} onSubmit={handleSubmit}>
<input
  value={input}
  onChange={(e) => setInput(e.target.value)}
  className={style.input}
  placeholder={`What is on your mind, ${walletAddress ? walletAddress.slice(0, 6) : 'Loading...'}...`}
/>
        </form>
      </div>

      <div className={style.actionsContainer}>
        <div className={style.actionButton}>
          <BsFillCameraVideoFill className={style.videoCamIcon} />
          <div className={style.actionButtonTitle}>Live Video</div>
        </div>
        <div className={style.actionButton}>
          <label htmlFor="videoUpload">
            <BsFileImageFill className={style.photoIcon} />
            <div className={style.actionButtonTitle}>Photo/Video</div>
          </label>
          <input
            id="videoUpload"
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <div className={style.actionButton} onClick={getAllPosts}>
          <FiRefreshCw className={style.refreshIcon} />
          <div className={style.actionButtonTitle}>Refresh Posts</div>
        </div>
        <button
          type="submit"
          className={style.actionButton}
          onClick={handleSubmit}
        >
          <div className={style.actionButtonTitle}>Post</div>
        </button>
      </div>
    </div>
  )
}

export default CreatePost
