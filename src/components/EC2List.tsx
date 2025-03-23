import React, { useState, useEffect } from 'react';
import { EC2Client, DescribeInstancesCommand } from '@aws-sdk/client-ec2';
import './EC2List.css';

const EC2List = () => {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [region, setRegion] = useState('ap-northeast-1'); // デフォルトは東京リージョン

  useEffect(() => {
    fetchInstances();
  }, [region]);

  const fetchInstances = async () => {
    setLoading(true);
    try {
      // EC2クライアントを初期化（認証情報は指定せず、IAMロールに依存）
      const client = new EC2Client({ region });
      
      // EC2インスタンスの情報を取得
      const command = new DescribeInstancesCommand({});
      const response = await client.send(command);
      
      // インスタンス情報を抽出して整形
      const instanceList = [];
      
      if (response.Reservations) {
        response.Reservations.forEach(reservation => {
          if (reservation.Instances) {
            reservation.Instances.forEach(instance => {
              // インスタンス名を取得
              let name = 'No Name';
              if (instance.Tags) {
                const nameTag = instance.Tags.find(tag => tag.Key === 'Name');
                if (nameTag) {
                  name = nameTag.Value;
                }
              }

              instanceList.push({
                id: instance.InstanceId,
                name: name,
                type: instance.InstanceType,
                state: instance.State?.Name,
                publicIp: instance.PublicIpAddress || '-',
                privateIp: instance.PrivateIpAddress || '-',
                launchTime: instance.LaunchTime,
                az: instance.Placement?.AvailabilityZone || '-'
              });
            });
          }
        });
      }

      setInstances(instanceList);
      setError(null);
    } catch (err) {
      console.error('EC2インスタンスの取得中にエラーが発生しました:', err);
      setError('EC2インスタンスの取得に失敗しました。IAMロールの権限を確認してください。');
    } finally {
      setLoading(false);
    }
  };

  // リージョン変更ハンドラー
  const handleRegionChange = (e) => {
    setRegion(e.target.value);
  };

  // インスタンスの状態に基づいたクラス名を取得
  const getStateClassName = (state) => {
    switch (state) {
      case 'running':
        return 'state-running';
      case 'stopped':
        return 'state-stopped';
      case 'pending':
        return 'state-pending';
      case 'stopping':
        return 'state-stopping';
      default:
        return 'state-other';
    }
  };

  return (
    <div className="ec2-list-container">
      <h2>EC2インスタンス一覧</h2>
      
      <div className="controls">
        <div className="region-selector">
          <label htmlFor="region">リージョン:</label>
          <select id="region" value={region} onChange={handleRegionChange}>
            <option value="us-east-1">US East (N. Virginia)</option>
            <option value="us-west-2">US West (Oregon)</option>
            <option value="eu-west-1">EU (Ireland)</option>
            <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
            <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
            <option value="ap-southeast-2">Asia Pacific (Sydney)</option>
          </select>
        </div>
        
        <button onClick={fetchInstances} className="refresh-button">
          更新
        </button>
      </div>
      
      {loading && <div className="loading">読み込み中...</div>}
      
      {error && <div className="error">{error}</div>}
      
      {!loading && !error && instances.length === 0 && (
        <div className="no-instances">該当するインスタンスが見つかりませんでした。</div>
      )}
      
      {!loading && !error && instances.length > 0 && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>名前</th>
                <th>インスタンスID</th>
                <th>タイプ</th>
                <th>状態</th>
                <th>アベイラビリティゾーン</th>
                <th>パブリックIP</th>
                <th>プライベートIP</th>
                <th>起動時間</th>
              </tr>
            </thead>
            <tbody>
              {instances.map(instance => (
                <tr key={instance.id}>
                  <td>{instance.name}</td>
                  <td>{instance.id}</td>
                  <td>{instance.type}</td>
                  <td>
                    <span className={`instance-state ${getStateClassName(instance.state)}`}>
                      {instance.state}
                    </span>
                  </td>
                  <td>{instance.az}</td>
                  <td>{instance.publicIp}</td>
                  <td>{instance.privateIp}</td>
                  <td>{new Date(instance.launchTime).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EC2List;
