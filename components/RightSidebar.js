import React, {useEffect} from 'react'
import Image from 'next/image'
import Contact from './Contact'


const RightSidebar = ({getUsers, users}) => {
    
    const style = {
        wrapper: `w-[24rem] text-lg text-white`,
        title: `text-[#afb3b8] font-semibold`,
        adsContainer: ``,
        ad: `flex items-center my-3 mr-[1rem] p-2 rounded-lg`,
        adImageContainer: `h-full w-[50%] flex items-center mr-[0.5rem]`,
        adImage: `object-cover`,
        adLink: `text-[#b0b3b8] text-sm`,
        divider: `w-[95%] border-b border-[0.5px] border-[#3e4042] my-2`,
        contact: `flex items-center my-2`,
        contactImage: `rounded-full object-cover`,
        contactName: `ml-4 text-[1rem]`,
      }

    useEffect(() => {
       ;(async () => {
        await getUsers()
       })()
    }, [])

  return (
    <div className={style.wrapper}>
        <div className={style.title}>Sponsored</div>
        <div className={style.adsContainer}>
            <div className={style.ad}>
                <div className={style.adImageContainer}>
                    <Image 
                    src={
                        'https://source.unsplash.com/tLZhFRLj6nY'
                    }
                    height={100}
                    width={100}
                    className = {style.adImage}
                    alt = ''
                    />
                </div>
                <div>
                    <div>Buy into WEB3</div>
                    <div className={style.adLink}>https://solana.com/</div>
                </div>
            </div>
            <div className={style.ad}>
                <div className={style.adImageContainer}>
                    <Image 
                    src = {
                        'https://ibb.co/5jB801X.png'
                    }
                    height={100}
                    width={100}
                    className = {style.adImage}
                    alt = ''
                    />
                </div>
                <div>
                    <div>Support your favorite creators and earn PYUSD</div>
                    <div className={style.adLink}>https://www.subscriptions.elios.com</div>
                </div>
            </div>
            <div className={style.divider}/>
            <div className={style.title}>Contacts</div>
            <div className={style.contactsContainer}>
                    {users.map(user =>{
                        return <Contact key = {user.walletAddress} user = {user}/>
                    })}
            </div>
        </div>
    </div>
  )
}

export default RightSidebar