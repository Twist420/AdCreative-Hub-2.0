export const getPriorityStyle = (priority) => {
  if (priority === 'Highest') return 'bg-rose-600 text-white'
  if (priority === 'High') return 'bg-rose-500 text-white'
  if (priority === 'Mid') return 'bg-amber-500 text-white'
  if (priority === 'Low') return 'bg-emerald-500 text-white'
  return 'bg-slate-300 text-white'
}

export const getStatusStyle = (status) => {
  if (status === 'Approved') return 'bg-emerald-50 text-emerald-600 border-emerald-100'
  if (status === 'Pending') return 'bg-amber-50 text-amber-600 border-amber-100'
  if (status === 'Modification') return 'bg-orange-50 text-orange-600 border-orange-100'
  return 'bg-slate-50 text-slate-500 border-slate-100'
}

export const getProdStatusStyle = (status) => {
  if (status === 'Completed') return 'bg-emerald-50 text-emerald-600 border-emerald-100'
  if (status === 'InProgress') return 'bg-blue-50 text-blue-600 border-blue-100'
  if (status === 'Scheduled') return 'bg-slate-50 text-slate-500 border-slate-100'
  return 'bg-slate-50 text-slate-400 border-slate-100'
}

export const getDeliveryStatusStyle = (status) => {
  if (status === 'Delivering') return 'text-emerald-600 border-emerald-200 bg-emerald-50'
  if (status === 'Paused') return 'text-slate-500 border-slate-200 bg-slate-50'
  return 'text-slate-400 border-slate-200 bg-slate-50'
}

export const getDeliveryStatusLabel = (status) => {
  if (status === 'Delivering') return '投放中'
  if (status === 'Paused') return '暂停投放'
  return '未投放'
}

export const getPriorityLabel = (priority) => {
  if (priority === 'Highest') return '最高'
  if (priority === 'High') return '高'
  if (priority === 'Low') return '低'
  return '中'
}

export const getReqStatusLabel = (status) => {
  if (status === 'Approved') return '审核通过'
  if (status === 'Pending') return '待审核'
  if (status === 'Modification') return '需求修改'
  return '草稿'
}

export const getProdStatusLabel = (status) => {
  if (status === 'Completed') return '已完成'
  if (status === 'InProgress') return '进行中'
  if (status === 'Scheduled') return '已排期'
  return '未排期'
}
