export const producers = [
  { name: '宋子仪', alias: 'szy', group: '美宣-平面', status: '在职' },
  { name: '吕远林', alias: 'lyl', group: '美宣-平面', status: '在职' },
  { name: '王金瑞', alias: 'wjr', group: '美宣-平面', status: '在职' },
  { name: '王春华', alias: 'wch', group: '美宣-平面', status: '离职' },
  { name: '李珊姗', alias: 'lss', group: '美宣-平面', status: '离职' },
  { name: '宋爽', alias: 'ss', group: '美宣-AI', status: '离职' },
  { name: '曲冬丽', alias: 'qdl', group: '美宣-2D', status: '在职' },
  { name: '张欢', alias: 'zh', group: '美宣-2D', status: '在职' },
  { name: '郭峰', alias: 'gf', group: '美宣-2D', status: '在职' },
  { name: '王佳鸿', alias: 'wjh', group: '美宣-2D', status: '在职' },
  { name: '吴楠', alias: 'wn', group: '美宣-2D', status: '在职' },
  { name: '周进易', alias: 'zjy', group: '美宣-2D', status: '离职' },
  { name: '邓莉', alias: 'dl', group: '美宣-2D', status: '离职' },
  { name: '蒋天宇', alias: 'jty', group: '美宣-2D', status: '离职' },
  { name: '张雨学', alias: 'zyx', group: '美宣-2D', status: '离职' },
  { name: '张澳', alias: 'za', group: '美宣-2D', status: '离职' },
  { name: '朱奇杰', alias: 'zqj', group: '美宣-2D', status: '离职' },
  { name: '刘洋', alias: 'ly', group: '美宣-3D', status: '在职' },
  { name: '孙崇洋', alias: 'scy', group: '美宣-3D', status: '在职' },
  { name: '张永进', alias: 'zyj', group: '美宣-3D', status: '在职' },
  { name: '李嘉鑫', alias: 'ljx', group: '程序', status: '在职' },
  { name: '肖环宇', alias: 'xhy', group: '程序', status: '在职' },
]

export const creativePeople = ['唐欣怡', '吉意煊', '马嘉良']

const PERSON_AVATAR_URLS = {
  唐欣怡: '/avatars/tang-xinyi.png',
  吉意煊: '/avatars/ji-yixuan.png',
  马嘉良: '/avatars/ma-jialiang.png',
  张欢: '/avatars/zhang-huan.png',
  何思乔: '/avatars/he-siqiao.png',
}

export const getInitial = (name = '') => String(name || '-').slice(0, 1)

export const getPersonAvatarUrl = (name = 'unknown') => {
  const normalizedName = name || 'unknown'
  return PERSON_AVATAR_URLS[normalizedName] || `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(normalizedName)}`
}
