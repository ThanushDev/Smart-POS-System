import React from 'react';

const Home: React.FC = () => {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">Welcome to Meku!</h1>
      <p className="text-lg text-gray-600 mb-8">Start building your amazing project here!</p>
    </section>
  );
};

export default Home;