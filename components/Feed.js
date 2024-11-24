import toast, { Toaster } from 'react-hot-toast'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'
import { SOLANA_HOST } from '../utils/const'
import { getProgramInstance } from '../utils/get-program'
import CreatePost from './CreatePost'
import Post from './Post.js'
import useWeb3 from '../hooks/useWeb3'

const anchor = require('@project-serum/anchor')
const { BN, web3 } = anchor
const utf8 = anchor.utils.bytes.utf8
const { SystemProgram } = web3

const defaultAccounts = {
  tokenProgram: TOKEN_PROGRAM_ID,
  clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
  systemProgram: SystemProgram.programId,
}

const Feed = ({ connected, name, url, address }) => {
  const style = {
    wrapper: `flex-1 max-w-2xl mx-4`,
  }

  const wallet = useWallet()
  const connection = new anchor.web3.Connection(SOLANA_HOST)
  const program = getProgramInstance(connection, wallet)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const { likePost, newPhoto } = useWeb3(url, name)

  useEffect(() => {
    const interval = setInterval(() => {
      getAllPosts()
    }, 2000)
    getAllPosts() // Load posts initially
    return () => clearInterval(interval)
  }, [connected])

  useEffect(() => {
    toast('Posts Refreshed!', {
      icon: '🔁',
      style: {
        borderRadius: '10px',
        background: '#252526',
        color: '#fffcf9',
      },
    })
  }, [posts.length])

  // Fetch all posts from the program
  const getAllPosts = async () => {
    try {
      const postsData = await program.account.postAccount.all()
      postsData.sort((a, b) => b.account.postTime.toNumber() - a.account.postTime.toNumber())
      setPosts(postsData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching posts:', error)
      setLoading(false)
    }
  }

  // Handle comments on posts
  const getCommentsOnPost = async (index) => {
    try {
      let [postSigner] = await anchor.web3.PublicKey.findProgramAddress(
        [utf8.encode('post'), index.toArrayLike(Buffer, 'be', 8)],
        program.programId,
      )
      const post = await program.account.postAccount.fetch(postSigner)
      let commentSigners = []
      for (let i = 0; i < post.commentCount.toNumber(); i++) {
        let [commentSigner] = await anchor.web3.PublicKey.findProgramAddress(
          [
            utf8.encode('comment'),
            new BN(index).toArrayLike(Buffer, 'be', 8),
            new BN(i).toArrayLike(Buffer, 'be', 8),
          ],
          program.programId,
        )
        commentSigners.push(commentSigner)
      }
      const comments = await program.account.commentAccount.fetchMultiple(commentSigners)
      comments.sort((a, b) => a.postTime.toNumber() - b.postTime.toNumber())
      return comments
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  // Save a post to the program
  const savePost = async (text) => {
    let [stateSigner] = await anchor.web3.PublicKey.findProgramAddress([utf8.encode('state')], program.programId)
    let stateInfo

    try {
      stateInfo = await program.account.stateAccount.fetch(stateSigner)
    } catch (error) {
      await program.rpc.createState({
        accounts: {
          state: stateSigner,
          authority: wallet.publicKey,
          ...defaultAccounts,
        },
      })
      return
    }

    let [postSigner] = await anchor.web3.PublicKey.findProgramAddress(
      [utf8.encode('post'), stateInfo.postCount.toArrayLike(Buffer, 'be', 8)],
      program.programId,
    )

    try {
      await program.account.postAccount.fetch(postSigner)
    } catch {
      const safeText = text ? String(text) : 'Default post text'
      const safeName = name ? String(name) : 'Anonymous'
      const safeUrl = url ? String(url) : 'https://default.url'

      try {
      console.log("123456")
        await program.rpc.createPost(safeText, safeName, safeUrl, {
          accounts: {
            state: stateSigner,
            post: postSigner,
            authority: wallet.publicKey,
            ...defaultAccounts,
          },
        })
        console.log("654321")
        setPosts(await program.account.postAccount.all())
      } catch (error) {
        console.error('Error creating post:', error)
      }
    }
  }

  // Save a comment to the program
  const saveComment = async (text, index, count) => {
    let [postSigner] = await anchor.web3.PublicKey.findProgramAddressSync(
      [utf8.encode('post'), index.toArrayLike(Buffer, 'be', 8)],
      program.programId,
    )

    try {
      let [commentSigner] = await anchor.web3.PublicKey.findProgramAddressSync(
        [
          utf8.encode('comment'),
          index.toArrayLike(Buffer, 'be', 8),
          count.toArrayLike(Buffer, 'be', 8),
        ],
        program.programId,
      )

      const safeText = text ? String(text) : 'Default comment text'
      const safeName = name ? String(name) : 'Anonymous'
      const safeUrl = url ? String(url) : 'https://default.url'

      await program.rpc.createComment(safeText, safeName, safeUrl, {
        accounts: {
          post: postSigner,
          comment: commentSigner,
          authority: wallet.publicKey,
          ...defaultAccounts,
        },
      })

      await program.account.commentAccount.fetch(commentSigner)
    } catch (error) {
      console.error('Error creating comment:', error)
    }
  }

  // Fetch latest blockhash using getLatestBlockhash
  const fetchLatestBlockhash = async () => {
    try {
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      console.log("Latest Blockhash:", blockhash)
      console.log("Last Valid Block Height:", lastValidBlockHeight)
      return { blockhash, lastValidBlockHeight }
    } catch (error) {
      console.error('Error fetching latest blockhash:', error)
    }
  }

  // You can call `fetchLatestBlockhash` whenever you need the latest blockhash
  useEffect(() => {
    fetchLatestBlockhash()
  }, [connected])

  return (
    <div className={style.wrapper}>
      <Toaster position="bottom-left" reverseOrder={false} />
      <div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div>
            <CreatePost savePost={savePost} getAllPosts={getAllPosts} name={name} url={url} />
            {posts && posts.length > 0 ? (
              posts.map((post) => (
                <Post
                  post={post.account}
                  viewDetail={getCommentsOnPost}
                  createComment={saveComment}
                  key={post.account.index}
                  name={name}
                  url={url}
                  address={post.publicKey.toBase58()}
                  likes={post.account.likes}
                  likePost={likePost}
                  likeAddress={post.account.peopleWhoLiked}
                />
              ))
            ) : (
              <div>No posts available</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Feed
