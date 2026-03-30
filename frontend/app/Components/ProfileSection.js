export default function ProfileSection({ user }) {
  return (
    <div className="flex items-center space-x-4 bg-gray-800 text-white p-4 rounded-lg">
      <img src={user.avatar} alt="Avatar" className="w-16 h-16 rounded-full" />
      <div>
        <h2 className="text-xl font-bold">{user.name}</h2>
        <p className="text-gray-300">{user.email}</p>
      </div>
    </div>
  );
}