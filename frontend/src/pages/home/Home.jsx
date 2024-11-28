import React from 'react'
import Navbar from '../../components/navbar/Navbar'
import Sidebar from '../../components/sidebar/Sidebar'
import Container from '../../components/container/Container'

const Home = () => {
  return (
    <>
    <Navbar/>
    <div style={{ display: "flex", overflow:"hidden", height:"100vh" }}>
    <Sidebar/>
    <Container/>
    </div>
    </>
  )
}

export default Home
