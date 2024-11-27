import React from 'react';

const NotificationPanel = () => {
  return (
    <div className="bg-yellow-100 p-4 border border-yellow-300 rounded mb-4">
      <h2 className="font-semibold">Notifications</h2>
      <ul>
        <li className="text-sm">Update pending on WordPress.</li>
        <li className="text-sm">Shell access login detected.</li>
      </ul>
    </div>
  );
};

export default NotificationPanel;
