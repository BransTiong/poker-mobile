'use client';

import { View, Text, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../hooks/supabase';
import GameEngine from '../../game/engine/GameEngine';
import { StyleSheet } from 'react-native';

export default function GamePage() {
    const { id } = useLocalSearchParams();
    const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
    const [gameState, setGameState] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        initializeGame();
    }, [id]);

    const initializeGame = async () => {
        try {
            // Fetch game data from Supabase
            const { data: gameData, error } = await supabase
                .from('Game')
                .select(`
                    *,
                    participants:GameParticipant(*)
                `)
                .eq('id', id)
                .single();

            if (error) throw error;

            // Initialize game engine with the number of participants
            const engine = new GameEngine(gameData.participants.length);
            engine.startNewHand();
            
            setGameEngine(engine);
            setGameState(engine.getGameState());
        } catch (error) {
            console.error('Error initializing game:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNextGame = () => {
        gameEngine?.startNewHand();
        setGameState(gameEngine?.getGameState());
    };

    return (
        <View style={styles.container}>
            {/* Opponents Section */}
            <View style={styles.opponents}>
                {gameState?.players.slice(0, -1).map((player: any, index: number) => (
                    <View key={player.id} style={styles.opponent}>
                        <View style={styles.avatar}>
                            {player.isDealer && <Text style={styles.dealerButton}>D</Text>}
                            {player.isSmallBlind && <Text style={styles.blindIndicator}>SB</Text>}
                            {player.isBigBlind && <Text style={styles.blindIndicator}>BB</Text>}
                        </View>
                        <Text style={styles.playerName}>Player {player.id}</Text>
                        <Text style={styles.chips}>{player.chips}</Text>
                    </View>
                ))}
            </View>

            {/* Community Cards */}
            <View style={styles.communityCards}>
                {gameState?.communityCards.map((card: any, index: number) => (
                    <View key={index} style={styles.card}>
                        <Text style={styles.cardText}>{`${card.rank}${card.suit}`}</Text>
                    </View>
                ))}
            </View>

            {/* Player Section */}
            <View style={styles.playerSection}>
                <View style={styles.playerInfo}>
                    <View style={styles.playerCards}>
                        {gameState?.players[gameState.players.length - 1].cards.map((card: any, index: number) => (
                            <View key={index} style={styles.card}>
                                <Text style={styles.cardText}>{`${card.rank}${card.suit}`}</Text>
                            </View>
                        ))}
                    </View>
                    <Text style={styles.playerChips}>
                        {gameState?.players[gameState.players.length - 1].chips}
                    </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.buttonText}>Call 1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.buttonText}>Raise 4</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.customRaiseButton}>
                        <Text style={styles.buttonText}>↑</Text>
                    </TouchableOpacity>
                </View>

                {/* Next Game Button */}
                <TouchableOpacity style={styles.nextGameButton} onPress={handleNextGame}>
                    <Text style={styles.buttonText}>Next Game</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 20,
    },
    opponents: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
    },
    opponent: {
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#333',
        marginBottom: 5,
    },
    dealerButton: {
        position: 'absolute',
        right: -10,
        bottom: -10,
        backgroundColor: 'white',
        color: 'black',
        borderRadius: 10,
        width: 20,
        height: 20,
        textAlign: 'center',
        fontSize: 12,
    },
    blindIndicator: {
        position: 'absolute',
        left: -10,
        bottom: -10,
        backgroundColor: '#ffd700',
        color: 'black',
        borderRadius: 12,
        padding: 2,
        fontSize: 10,
    },
    playerName: {
        color: 'white',
    },
    chips: {
        color: 'white',
    },
    communityCards: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginVertical: 20,
    },
    card: {
        width: 60,
        height: 90,
        backgroundColor: 'white',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cardText: {
        fontSize: 24,
        color: 'black',
    },
    playerSection: {
        marginTop: 'auto',
        padding: 20,
    },
    playerInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    playerCards: {
        flexDirection: 'row',
        gap: 10,
    },
    playerChips: {
        fontSize: 24,
        color: 'white',
        marginLeft: 20,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    actionButton: {
        padding: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333',
        flex: 1,
    },
    customRaiseButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
    },
    nextGameButton: {
        padding: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333',
        marginTop: 10,
    },
});