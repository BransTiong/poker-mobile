'use client';

import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
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
            // Initialize game engine with 5 players
            const engine = new GameEngine(5);
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

    const getPlayerPosition = (player: any) => {
        const positions = [];
        if (player.isDealer) positions.push('D');
        if (player.isSmallBlind) positions.push('SB');
        if (player.isBigBlind) positions.push('BB');
        return positions.join('/');
    };

    const getCardColor = (suit: string) => {
        return suit === '♥' || suit === '♦' ? '#ff0000' : '#000000';
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Opponents Section */}
            <View style={styles.opponents}>
                {gameState?.players.slice(0, -1).map((player: any, index: number) => (
                    <View key={player.id} style={styles.opponent}>
                        <View style={styles.avatar}>
                            <Text style={styles.position}>{getPlayerPosition(player)}</Text>
                        </View>
                        <Text style={styles.playerName}>Bot {player.id}</Text>
                        <Text style={styles.chips}>${player.chips}</Text>
                        <View style={styles.opponentCards}>
                            {player.cards.map((card: any, cardIndex: number) => (
                                <View key={cardIndex} style={styles.smallCard}>
                                    <Text style={[
                                        styles.smallCardText,
                                        { color: getCardColor(card.suit) }
                                    ]}>
                                        {`${card.rank}${card.suit}`}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
            </View>

            {/* Community Cards */}
            <View style={styles.communityCardsContainer}>
                <View style={styles.communityCards}>
                    {gameState?.communityCards.map((card: any, index: number) => (
                        <View key={index} style={styles.card}>
                            <Text style={[
                                styles.cardText,
                                { color: getCardColor(card.suit) }
                            ]}>
                                {`${card.rank}${card.suit}`}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Player Section */}
            <View style={styles.playerSection}>
                <View style={styles.playerInfo}>
                    <View style={styles.playerCards}>
                        {gameState?.players[gameState.players.length - 1].cards.map((card: any, index: number) => (
                            <View key={index} style={styles.card}>
                                <Text style={[
                                    styles.cardText,
                                    { color: getCardColor(card.suit) }
                                ]}>
                                    {`${card.rank}${card.suit}`}
                                </Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.playerDetails}>
                        <Text style={styles.position}>
                            {getPlayerPosition(gameState?.players[gameState.players.length - 1])}
                        </Text>
                        <Text style={styles.playerChips}>
                            ${gameState?.players[gameState.players.length - 1].chips}
                        </Text>
                    </View>
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    position: {
        color: '#ffd700',
        fontSize: 14,
        fontWeight: 'bold',
    },
    playerName: {
        color: 'white',
        marginBottom: 2,
    },
    chips: {
        color: 'white',
        marginBottom: 5,
    },
    communityCardsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    communityCards: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
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
    playerDetails: {
        alignItems: 'center',
    },
    playerChips: {
        fontSize: 24,
        color: 'white',
        marginTop: 5,
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
    opponentCards: {
        flexDirection: 'row',
        gap: 5,
        marginTop: 5,
    },
    smallCard: {
        width: 30,
        height: 45,
        backgroundColor: 'white',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 2,
    },
    smallCardText: {
        fontSize: 12,
        color: 'black',
    },
});