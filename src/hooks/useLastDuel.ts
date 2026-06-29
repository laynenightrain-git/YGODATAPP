import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreateDuelInput } from '../types';

const LAST_DUEL_KEY = '@masterduel_last_duel';

/**
 * 保存上次对局的完整信息
 * - 卡组、硬币、先后手、胜负、对手卡组、备注
 * - 下次录入时自动恢复卡组和对手卡组
 * - "复制上一局"按钮恢复全部字段
 */
export async function saveLastDuel(input: CreateDuelInput): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_DUEL_KEY, JSON.stringify(input));
  } catch {
    // 忽略存储错误
  }
}

/**
 * 读取上次对局的完整信息
 */
export async function loadLastDuel(): Promise<CreateDuelInput | null> {
  try {
    const raw = await AsyncStorage.getItem(LAST_DUEL_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CreateDuelInput;
  } catch {
    return null;
  }
}
