import React from 'react'
import { FaBook, FaGraduationCap } from 'react-icons/fa'

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md py-4 px-6">
      <div className="container mx-auto flex flex-col items-center justify-center">
        <div className="flex items-center space-x-3">
          <FaGraduationCap className="text-3xl text-white" />
          <h1 className="text-2xl font-bold text-white">
            Study Buddy
          </h1>
        </div>
        <div className="text-sm text-indigo-100 mt-1">
          Hecho con ❤️ por Miguel Gomez 
        </div>
      </div>
    </header>
  )
}

export default Header
